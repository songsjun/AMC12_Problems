# Threat model: AMC 12 learning review and question tutor

## Scope and data classification

The feature processes authenticated student identity, timed answers, free-form reasoning, uploaded text/audio, transcripts, AI prompts/results, and chat history. Audio and free-form text may contain personal information. Provider and session credentials are secrets.

## Actors, assets, and data flow

Actors are the authenticated student, content reviewer, application/worker operator, local unprivileged process, AssemblyAI, and the isolated inference service. Protected assets are official score integrity, answer/solution release entitlement, student evidence/audio/chat, approved-content lineage, credentials, provider quota, and deletion evidence. The browser sends evidence to the API; the API commits application state to PostgreSQL/private storage; workers re-authorize leased work before sending minimum data to fixed providers; only validated application projections return to the owner. The first release has no provider webhook.

## Trust boundaries

| Boundary | Data | Required controls |
|---|---|---|
| Browser to nginx/API | answer drafts, reasoning, files, chat | TLS, session, CSRF, idempotency, owner checks, route-specific rate/size limits |
| API to private storage | uploaded bytes | random storage keys, no user path joins, restrictive permissions, quotas, lifecycle deletion |
| Worker to AssemblyAI | audio/transcript ID | server-only key, fixed allowlisted base URL, timeouts, redacted logs, provider deletion |
| Worker to inference service | prompts/results | dedicated credential/instance, tool-free non-persistent endpoint, strict result validation, bounded input |
| Content source to model | community Markdown | reviewed solution status, deterministic sanitization, data delimiters, no tool execution |
| Database to browser | reports/chat | minimum response projection, ownership and release-gate checks |

## Prioritized threats

### Critical: pre-final answer or solution disclosure

**Attack:** An authenticated student guesses a learning-submission, report, context, or thread ID while a timed attempt is active.

**Controls:** Derive release permission on the server from an exact owned final submission, or from a separately published `OPEN_REVIEW` revision that can never be timed. A committed batch alone grants nothing. Never accept a client-provided `finalized` flag, form version, correct answer, or context-set ID. Enforce entitlement at HTTP, enqueue, worker context load, provider call, retry, reassessment, fork, and message. Batch extraction never receives answer keys or solutions. Add endpoint/provider-spy tests for every pre-final phase, active-timed-plus-batch path, and reset-history edge case.

### High: horizontal authorization bypass

**Attack:** One student reads or writes another student's upload, report, transcript, or chat thread by UUID.

**Controls:** Every lookup joins through the authenticated student/owned attempt or learning submission. Do not fetch by resource ID and check ownership afterward when child rows could already be disclosed. Test cross-student GET, mutation, retry, delete, and thread-message paths.

### High: secret exposure

**Attack:** A provider key is returned in configuration JSON, embedded in browser code, committed, or written to logs/errors.

**Controls:** Server-only protected environment, response allowlists, header/error redaction, secret-scanning tests, and immediate rotation of any key disclosed outside the secret store. There is no browser provider-config endpoint.

### Critical: model-executor privilege and environment leakage

**Attack:** Prompt-injected student text or community Markdown reaches an agentic CLI. The spawned model process inherits the API service environment or can read same-user secret files, then includes a database/session/provider credential in its result. A read-only filesystem sandbox does not prevent reads or inherited-environment disclosure.

**Controls:** Do not send feature input through the current CLI or persistent Gateway job path. Require a tool-free, non-persistent inference endpoint with an explicit minimal environment and credentials outside any model-visible tool context. Deny shell, filesystem, and arbitrary network capability; cap resources. Run canary-secret prompt-injection tests for inherited environment, host files, and the executor's own provider credential, and fail closed if any canary appears in response, transient output, queue storage, or logs. Rotate the AssemblyAI key supplied in planning before any deployment because it has already been disclosed outside the secret store.

### High: upload resource exhaustion and path traversal

**Attack:** Oversized/many files fill disk or memory; deceptive filenames escape the storage root; MIME spoofing invokes unsafe decoders.

**Controls:** Stream uploads; application, nginx, per-file, per-batch, and per-student quotas; random storage keys; resolved-path containment checks; magic-byte/media probing; filename display-only; atomic partial-file cleanup; time/duration limits; no shell interpolation. Test traversal names, symlinks, truncated media, oversized bodies, and disconnects.

### High: indirect prompt injection or unsafe model output

**Attack:** Uploaded reasoning or community Markdown instructs the model to reveal other data, ignore scope, or emit active markup.

**Controls:** Only the current owned question-context snapshot enters a tutor run; approved solution sections remain delimited as untrusted data; web/tools are absent; prompt and output are bounded; structured analysis uses strict schemas and rejects unknown/invalid values. Model Markdown uses a restricted renderer: no raw HTML, external media, active links, or MathJax URL/style/HTML/loading macros. CSP stays restrictive and private responses are `no-store`.

### Medium: AI and transcription denial of service

**Attack:** Repeated submissions/chat exhaust provider quota or starve interactive requests behind batch jobs.

**Controls:** per-student and global rate limits, maximum active batch, cost/usage audit, prioritized application queue, bounded retries with backoff, terminal failure, cancel/delete, and reserved/dedicated chat capacity.

### Medium: replay, duplicate cost, and conflicting revisions

**Attack:** Repeated upload/commit/message requests create duplicate provider charges or reorder chat.

**Controls:** Idempotency keys plus request hashes, unique input hashes, submission/thread revisions, provider external IDs stored before polling, job leases, and ordered per-thread sequence numbers.

### Medium: retention and deletion failure

**Attack:** Student deletes a submission but audio/transcript/provider artifacts or backups remain indefinitely.

**Controls:** Documented retention classes, tombstone plus asynchronous purge state, provider deletion audit, private-file deletion, chat/report cascade policy, and visible deletion status. Never claim deletion complete until every configured target reaches a terminal deletion state.

Workers carry a deletion generation and condition every write on a live matching resource, so an old result cannot resurrect a tombstoned transcript/report/chat. Audit events retain actor/resource opaque IDs, action/status, hashes, version, cost bucket, and timestamp, but no student body text, original filename, prompt, raw provider body, credential, or storage path.

### Medium: information leakage through diagnostics

**Attack:** Raw provider bodies, prompts, transcripts, paths, or stack traces reach clients or broad logs.

**Controls:** stable public error codes, structured redacted logs, restricted audit access, no raw stdout/stderr in API projections, and production error-handler tests.

## Security test gate

- Pre-final report/context/chat requests are rejected without calling any AI provider.
- Cross-student access is rejected for every new parent and child endpoint.
- CSRF and idempotency are enforced for all mutations.
- Upload tests cover size/count/type/path/symlink/disconnect boundaries.
- URLs used by provider adapters come only from trusted configuration; user URLs are never fetched.
- AssemblyAI redirects and non-allowlisted upload URL host/path values are rejected; URL-parser dependency advisories are closed before release.
- Invalid or instruction-shaped AI output cannot become structured analysis or active HTML.
- Chat/message length, active work, and per-student rates are bounded.
- Secrets and raw provider output are absent from browser responses and committed fixtures.
- A prompt-injection canary cannot recover inherited environment values or same-host secret files from the production-equivalent model executor.
- A prompt-injection canary also cannot recover the executor's own provider credential, access arbitrary networks, or leave prompt/result content in Gateway job storage.
- Deletion reaches explicit local/provider terminal states and is retryable.
