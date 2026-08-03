import { badRequest, conflict } from './errors.js';

export const OPTIONS = Object.freeze(['A', 'B', 'C', 'D', 'E']);
export const PHASES = Object.freeze({
  TIMED: 'TIMED',
  LIMIT_NOTICE: 'LIMIT_NOTICE',
  OVERTIME: 'OVERTIME',
  FINALIZED: 'FINALIZED',
  RESET: 'RESET',
  OPEN_REVIEW: 'OPEN_REVIEW',
  BATCH_REVIEW: 'BATCH_REVIEW'
});
export const CLOCK_STATES = Object.freeze({ RUNNING: 'RUNNING', PAUSED: 'PAUSED' });
export const SUBMISSION_KINDS = Object.freeze({
  CHECKPOINT: 'CHECKPOINT',
  DEADLINE: 'DEADLINE',
  FINAL: 'FINAL'
});

export const DEFAULT_DURATION_MS = 75 * 60 * 1000;

export function isOption(value) {
  return OPTIONS.includes(value);
}

export function assertSelectedOption(value) {
  if (value !== null && !isOption(value)) {
    throw badRequest('INVALID_OPTION', 'Each selected option must be A, B, C, D, E, or null.');
  }
}

export function roundPoints(value) {
  // Four places retains configured policies while avoiding binary drift in API output.
  return Math.round((value + Number.EPSILON) * 10_000) / 10_000;
}

export function elapsedAt(attempt, now) {
  if (attempt.clockState !== CLOCK_STATES.RUNNING || !attempt.clockStartedAt) {
    return attempt.activeElapsedMs;
  }
  const delta = Math.max(0, new Date(now).getTime() - new Date(attempt.clockStartedAt).getTime());
  return attempt.activeElapsedMs + delta;
}

export function elapsedForTimedLimit(attempt, now) {
  return Math.min(elapsedAt(attempt, now), attempt.durationMs);
}

export function isPreFinalPhase(phase) {
  return phase === PHASES.TIMED || phase === PHASES.LIMIT_NOTICE || phase === PHASES.OVERTIME;
}

export function canEditAnswers(attempt) {
  // Pausing the clock intentionally also pauses editing. This prevents a pause
  // control from becoming an unlimited untimed-answer loophole.
  return (attempt.phase === PHASES.TIMED || attempt.phase === PHASES.OVERTIME)
    && attempt.clockState === CLOCK_STATES.RUNNING;
}

export function publicForm(form) {
  return {
    id: form.id,
    version: form.version,
    title: form.title,
    durationMs: form.durationMs,
    questionCount: form.questions.length,
    practiceKind: form.practiceKind || 'standard',
    archiveNotice: form.archiveNotice || null,
    questions: form.questions.map((question) => ({
      number: question.number,
      promptMarkdown: question.promptMarkdown,
      isScored: question.isScored !== false,
      choices: question.choices.map((choice) => ({
        option: choice.option,
        textMarkdown: choice.textMarkdown
      }))
    }))
  };
}

export function publicFormSummary(form) {
  return {
    id: form.id,
    version: form.version,
    title: form.title,
    durationMs: form.durationMs,
    questionCount: form.questions.length,
    practiceKind: form.practiceKind || 'standard',
    archiveNotice: form.archiveNotice || null,
    scoredQuestionCount: Number.isSafeInteger(form.scoredQuestionCount)
      ? form.scoredQuestionCount
      : form.questions.filter((question) => question.isScored !== false).length
  };
}

export function publicAttempt(attempt, answers, submissions = [], now = new Date()) {
  const currentElapsedMs = attempt.phase === PHASES.TIMED
    ? elapsedForTimedLimit(attempt, now)
    : elapsedAt(attempt, now);
  return {
    id: attempt.id,
    attemptMode: attempt.attemptMode || 'TIMED',
    formId: attempt.formId,
    formVersion: attempt.formVersion,
    phase: attempt.phase,
    clockState: attempt.clockState,
    durationMs: attempt.durationMs,
    activeElapsedMs: currentElapsedMs,
    remainingMs: Math.max(0, attempt.durationMs - currentElapsedMs),
    answersRevision: attempt.answersRevision,
    reasoningRevision: Number.isSafeInteger(attempt.reasoningRevision) ? attempt.reasoningRevision : 0,
    stateRevision: Number.isSafeInteger(attempt.stateRevision) ? attempt.stateRevision : 0,
    answers: [...answers]
      .sort((a, b) => a.questionNumber - b.questionNumber)
      .map(({ questionNumber, selectedOption }) => ({ questionNumber, selectedOption })),
    limitReachedAt: attempt.limitReachedAt || null,
    createdAt: attempt.createdAt,
    updatedAt: attempt.updatedAt,
    finalizedAt: attempt.finalizedAt || null,
    resetAt: attempt.resetAt || null,
    resultsAvailable: submissions.some((submission) => submission.kind === SUBMISSION_KINDS.FINAL),
    submissions: submissions.map(publicSubmission)
  };
}

export function publicSubmission(submission) {
  return {
    id: submission.id,
    kind: submission.kind,
    activeElapsedMs: submission.activeElapsedMs,
    score: {
      totalPoints: submission.totalPoints,
      maximumPoints: submission.maximumPoints,
      answeredCount: submission.answeredCount,
      correctCount: submission.correctCount,
      incorrectCount: submission.incorrectCount,
      blankCount: submission.blankCount,
      unscoredCount: submission.unscoredCount || 0
    },
    scoringPolicy: {
      id: submission.scoringPolicy.id,
      version: submission.scoringPolicy.version
    },
    createdAt: submission.createdAt
  };
}

export function scoreSubmission({ form, answers, activeElapsedMs }) {
  const policy = form.scoringPolicy;
  const answerByNumber = new Map(answers.map((answer) => [answer.questionNumber, answer.selectedOption]));
  let totalPoints = 0;
  let answeredCount = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let blankCount = 0;
  let unscoredCount = 0;
  const snapshots = form.questions.map((question) => {
    const selectedOption = answerByNumber.get(question.number) ?? null;
    const isScored = question.isScored !== false;
    if (!isScored) {
      unscoredCount += 1;
      return {
        questionNumber: question.number,
        selectedOption,
        correctOption: null,
        acceptedOptions: [],
        isScored: false,
        isCorrect: null,
        points: 0
      };
    }
    let points;
    let isCorrect;
    if (selectedOption === null) {
      blankCount += 1;
      points = policy.blankPoints;
      isCorrect = null;
    } else if ((question.acceptedOptions || [question.correctOption]).includes(selectedOption)) {
      answeredCount += 1;
      correctCount += 1;
      points = policy.correctPoints;
      isCorrect = true;
    } else {
      answeredCount += 1;
      incorrectCount += 1;
      points = policy.incorrectPoints;
      isCorrect = false;
    }
    totalPoints = roundPoints(totalPoints + points);
    return {
      questionNumber: question.number,
      selectedOption,
      correctOption: question.correctOption,
      acceptedOptions: question.acceptedOptions || [question.correctOption],
      isScored: true,
      isCorrect,
      points: roundPoints(points)
    };
  });
  return {
    activeElapsedMs,
    scoringPolicy: structuredClone(policy),
    totalPoints: roundPoints(totalPoints),
    maximumPoints: roundPoints(form.questions.filter((question) => question.isScored !== false).length * policy.correctPoints),
    answeredCount,
    correctCount,
    incorrectCount,
    blankCount,
    unscoredCount,
    snapshots
  };
}

export function assertMutableAnswerPhase(attempt) {
  if (attempt.phase === PHASES.LIMIT_NOTICE) {
    throw conflict('LIMIT_NOTICE_REQUIRED', 'Choose whether to finalize or continue before changing answers.');
  }
  if (!canEditAnswers(attempt)) {
    throw conflict('INVALID_STATE', 'Answers can only be changed while the attempt clock is running.');
  }
}

export function assertOneOf(value, allowed, code = 'INVALID_VALUE') {
  if (!allowed.includes(value)) {
    throw badRequest(code, `Expected one of: ${allowed.join(', ')}.`);
  }
}
