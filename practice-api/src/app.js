import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { ApiError, badRequest, toErrorPayload, unauthorized } from './errors.js';
import { MAX_AUDIO_FILE_BYTES } from './batch-ingest/domain.js';

function cookieOptions(config) {
  return {
    path: config.cookiePath,
    sameSite: 'strict',
    secure: config.secureCookies,
    maxAge: Math.floor(config.sessionTtlMs / 1_000)
  };
}

function readSignedCookie(request, name) {
  const raw = request.cookies[name];
  if (!raw) return null;
  const unsigned = request.unsignCookie(raw);
  return unsigned.valid ? unsigned.value : null;
}

function idempotencyKey(request) {
  const value = request.headers['idempotency-key'];
  return Array.isArray(value) ? value[0] : value;
}

function csrfHeader(request) {
  const value = request.headers['x-csrf-token'];
  return Array.isArray(value) ? value[0] : value;
}

function bodyObject(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw badRequest('VALIDATION_ERROR', 'Request body must be a JSON object.');
  }
  return body;
}

/** Build an injectable API app; server.js is intentionally the only network entrypoint. */
export async function buildApp({ service, config, logger = false }) {
  const app = Fastify({
    logger,
    bodyLimit: config.bodyLimit,
    trustProxy: config.trustedProxy || false
  });
  const reasoningWriteWindows = new Map();
  const reasoningWritesPerMinute = config.reasoningWritesPerMinute || 30;

  function enforceReasoningWriteRate(studentId) {
    const now = Date.now();
    let window = reasoningWriteWindows.get(studentId);
    if (!window || now - window.startedAt >= 60_000) {
      window = { startedAt: now, count: 0 };
    }
    if (window.count >= reasoningWritesPerMinute) {
      throw new ApiError(429, 'REASONING_RATE_LIMITED', 'Too many reasoning updates. Please try again later.');
    }
    window.count += 1;
    reasoningWriteWindows.set(studentId, window);
    if (reasoningWriteWindows.size > 10_000) {
      for (const [candidateId, candidate] of reasoningWriteWindows) {
        if (now - candidate.startedAt >= 60_000) reasoningWriteWindows.delete(candidateId);
      }
    }
  }

  await app.register(cookie, { secret: config.sessionSecret, hook: 'onRequest' });
  await app.register(helmet, {
    global: true,
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  });
  await app.register(rateLimit, {
    global: true,
    max: 240,
    timeWindow: '1 minute',
    keyGenerator: (request) => request.ip
  });
  if (config.corsOrigin) {
    await app.register(cors, {
      origin: config.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'Idempotency-Key']
    });
  }

  // The upload route consumes this stream directly into private storage. JSON
  // routes retain Fastify's small global body limit and ordinary parser.
  app.addContentTypeParser('application/octet-stream', (request, payload, done) => {
    done(null, payload);
  });

  app.setErrorHandler((error, request, reply) => {
    const apiError = error instanceof ApiError ? error : null;
    if (!apiError && error.statusCode === 429) {
      return reply.status(429).send({
        error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' }
      });
    }
    if (!apiError && error.statusCode === 413) {
      return reply.status(413).send({
        error: { code: 'PAYLOAD_TOO_LARGE', message: 'The request body is too large.' }
      });
    }
    if (!apiError) request.log.error({ err: error }, 'Unhandled AMC practice API error');
    const statusCode = apiError?.statusCode || 500;
    if (statusCode === 429 && Number.isSafeInteger(apiError?.details?.retryAfterSeconds)) {
      reply.header('Retry-After', String(apiError.details.retryAfterSeconds));
    }
    return reply.status(statusCode).send(toErrorPayload(apiError || error));
  });

  async function requireAuth(request) {
    if (request.auth) return request.auth;
    const sessionId = readSignedCookie(request, config.cookieName);
    if (!sessionId) throw unauthorized();
    const authenticated = await service.authenticateSession(sessionId);
    await service.consumeStudentRequestBudget(authenticated.student.id);
    request.auth = { ...authenticated, sessionToken: sessionId };
    return request.auth;
  }

  async function requireCsrf(request) {
    const auth = await requireAuth(request);
    service.assertCsrf(auth.session, csrfHeader(request));
    return auth;
  }

  function setSessionCookies(reply, session, csrfToken) {
    reply.setCookie(config.cookieName, session.sessionToken, {
      ...cookieOptions(config),
      httpOnly: true,
      signed: true
    });
    // This signed, SameSite token is intentionally readable by the SPA so it
    // can put the token in a custom header. The session cookie stays HttpOnly.
    reply.setCookie(config.csrfCookieName, csrfToken, {
      ...cookieOptions(config),
      httpOnly: false,
      signed: true
    });
  }

  function clearSessionCookies(reply) {
    reply.clearCookie(config.cookieName, { path: config.cookiePath });
    reply.clearCookie(config.csrfCookieName, { path: config.cookiePath });
  }

  const base = config.basePath;
  app.get(`${base}/health`, async () => ({ status: 'ok' }));

  app.post(`${base}/auth/login`, {
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } }
  }, async (request, reply) => {
    const body = bodyObject(request.body);
    const result = await service.login(body.accessCode);
    setSessionCookies(reply, result, result.csrfToken);
    return reply.status(200).send({ student: result.student, csrfToken: result.csrfToken });
  });

  app.get(`${base}/auth/me`, async (request) => {
    const auth = await requireAuth(request);
    const csrfToken = readSignedCookie(request, config.csrfCookieName);
    if (!csrfToken) throw unauthorized('SESSION_CSRF_MISSING', 'Sign in again to establish a CSRF token.');
    service.assertCsrf(auth.session, csrfToken);
    return { student: auth.student, csrfToken };
  });

  app.post(`${base}/auth/logout`, async (request, reply) => {
    const auth = await requireCsrf(request);
    await service.logout(auth.sessionToken);
    clearSessionCookies(reply);
    return reply.status(204).send();
  });

  app.get(`${base}/forms`, async (request) => {
    await requireAuth(request);
    return { forms: await service.listForms() };
  });
  app.get(`${base}/forms/:formId`, async (request) => {
    await requireAuth(request);
    return { form: await service.getPublicForm(request.params.formId) };
  });
  app.get(`${base}/forms/:formId/versions/:version`, async (request) => {
    await requireAuth(request);
    return { form: await service.getPublicFormVersion(request.params.formId, request.params.version) };
  });

  app.post(`${base}/attempts`, async (request, reply) => {
    const auth = await requireCsrf(request);
    const body = bodyObject(request.body);
    const result = await service.createAttempt(auth.student.id, body.formId);
    return reply.status(result.created ? 201 : 200).send({ attempt: result.attempt });
  });
  app.get(`${base}/attempts`, async (request) => {
    const auth = await requireAuth(request);
    return { attempts: await service.listAttempts(auth.student.id) };
  });
  app.get(`${base}/attempts/:attemptId`, async (request) => {
    const auth = await requireAuth(request);
    return { attempt: await service.getAttempt(auth.student.id, request.params.attemptId) };
  });
  app.get(`${base}/attempts/:attemptId/form`, async (request) => {
    const auth = await requireAuth(request);
    return { form: await service.getAttemptPublicForm(auth.student.id, request.params.attemptId) };
  });
  app.put(`${base}/attempts/:attemptId/answers`, async (request) => {
    const auth = await requireCsrf(request);
    return { attempt: await service.putAnswers(auth.student.id, request.params.attemptId, bodyObject(request.body)) };
  });
  app.get(`${base}/attempts/:attemptId/reasoning-notes`, async (request, reply) => {
    const auth = await requireAuth(request);
    reply.header('Cache-Control', 'no-store').header('Pragma', 'no-cache');
    return service.getReasoning(auth.student.id, request.params.attemptId);
  });
  app.put(`${base}/attempts/:attemptId/reasoning-notes`, async (request, reply) => {
    const auth = await requireCsrf(request);
    enforceReasoningWriteRate(auth.student.id);
    reply.header('Cache-Control', 'no-store').header('Pragma', 'no-cache');
    return service.putReasoning(
      auth.student.id,
      request.params.attemptId,
      idempotencyKey(request),
      bodyObject(request.body)
    );
  });
  app.post(`${base}/attempts/:attemptId/pause`, async (request) => {
    const auth = await requireCsrf(request);
    return service.pause(auth.student.id, request.params.attemptId, idempotencyKey(request));
  });
  app.post(`${base}/attempts/:attemptId/resume`, async (request) => {
    const auth = await requireCsrf(request);
    return service.resume(auth.student.id, request.params.attemptId, idempotencyKey(request));
  });
  app.post(`${base}/attempts/:attemptId/checkpoint`, async (request) => {
    const auth = await requireCsrf(request);
    return service.checkpoint(auth.student.id, request.params.attemptId, idempotencyKey(request), bodyObject(request.body));
  });
  app.post(`${base}/attempts/:attemptId/final`, async (request) => {
    const auth = await requireCsrf(request);
    return service.final(auth.student.id, request.params.attemptId, idempotencyKey(request), bodyObject(request.body));
  });
  app.post(`${base}/attempts/:attemptId/deadline-decision`, async (request) => {
    const auth = await requireCsrf(request);
    const body = bodyObject(request.body);
    return service.deadlineDecision(auth.student.id, request.params.attemptId, body.decision, idempotencyKey(request), body);
  });
  app.post(`${base}/attempts/:attemptId/reset`, async (request, reply) => {
    const auth = await requireCsrf(request);
    const result = await service.reset(auth.student.id, request.params.attemptId, idempotencyKey(request));
    return reply.status(201).send(result);
  });
  app.get(`${base}/attempts/:attemptId/results`, async (request) => {
    const auth = await requireAuth(request);
    return service.getResults(auth.student.id, request.params.attemptId);
  });
  app.get(`${base}/attempts/:attemptId/learning-submission`, async (request, reply) => {
    const auth = await requireAuth(request);
    reply.header('Cache-Control', 'no-store').header('Pragma', 'no-cache');
    return { learningSubmission: await service.getLearningSubmission(auth.student.id, request.params.attemptId) };
  });
  app.get(`${base}/attempts/:attemptId/learning-report`, async (request, reply) => {
    const auth = await requireAuth(request);
    reply.header('Cache-Control', 'no-store').header('Pragma', 'no-cache');
    return service.getLearningReport(auth.student.id, request.params.attemptId);
  });
  app.get(`${base}/attempts/:attemptId/solutions`, async (request) => {
    const auth = await requireAuth(request);
    return service.getSolutions(auth.student.id, request.params.attemptId);
  });
  app.post(`${base}/attempts/:attemptId/learning-batches`, async (request, reply) => {
    const auth = await requireCsrf(request);
    const result = await service.createLearningBatch(
      auth.student.id, request.params.attemptId, idempotencyKey(request), bodyObject(request.body)
    );
    reply.header('Cache-Control', 'no-store').header('Pragma', 'no-cache');
    return reply.status(result.created ? 201 : 200).send(result);
  });
  app.get(`${base}/attempts/:attemptId/learning-batches`, async (request, reply) => {
    const auth = await requireAuth(request);
    reply.header('Cache-Control', 'no-store').header('Pragma', 'no-cache');
    return service.listLearningBatches(auth.student.id, request.params.attemptId);
  });
  app.get(`${base}/attempts/:attemptId/learning-batches/:batchId`, async (request, reply) => {
    const auth = await requireAuth(request);
    reply.header('Cache-Control', 'no-store').header('Pragma', 'no-cache');
    return service.getLearningBatch(auth.student.id, request.params.attemptId, request.params.batchId);
  });
  app.put(`${base}/attempts/:attemptId/learning-batches/:batchId/assets/:assetId/body`, {
    bodyLimit: MAX_AUDIO_FILE_BYTES
  }, async (request, reply) => {
    const auth = await requireCsrf(request);
    if (request.headers['content-type'] !== 'application/octet-stream') {
      throw badRequest('UNSUPPORTED_UPLOAD_ENVELOPE', 'Batch asset bodies use application/octet-stream.');
    }
    reply.header('Cache-Control', 'no-store').header('Pragma', 'no-cache');
    return service.uploadLearningBatchAsset(
      auth.student.id, request.params.attemptId, request.params.batchId, request.params.assetId,
      idempotencyKey(request), request.body, Number(request.headers['content-length'])
    );
  });
  app.post(`${base}/attempts/:attemptId/learning-batches/:batchId/submit`, async (request, reply) => {
    const auth = await requireCsrf(request);
    reply.header('Cache-Control', 'no-store').header('Pragma', 'no-cache');
    return service.submitLearningBatch(
      auth.student.id, request.params.attemptId, request.params.batchId, idempotencyKey(request)
    );
  });
  app.post(`${base}/attempts/:attemptId/learning-batches/:batchId/confirm`, async (request, reply) => {
    const auth = await requireCsrf(request);
    reply.header('Cache-Control', 'no-store').header('Pragma', 'no-cache');
    return service.confirmLearningBatch(
      auth.student.id, request.params.attemptId, request.params.batchId,
      idempotencyKey(request), bodyObject(request.body)
    );
  });
  app.delete(`${base}/attempts/:attemptId/learning-batches/:batchId`, async (request, reply) => {
    const auth = await requireCsrf(request);
    reply.header('Cache-Control', 'no-store').header('Pragma', 'no-cache');
    return service.deleteLearningBatch(
      auth.student.id, request.params.attemptId, request.params.batchId, idempotencyKey(request)
    );
  });

  return app;
}
