import { canonicalHash } from './canonical.js';

export function aggregateReportStatus(outcomes) {
  const succeeded = outcomes.filter((item) => item.status === 'SUCCEEDED').length;
  const failed = outcomes.filter((item) => item.status === 'FAILED').length;
  const unassessable = outcomes.length - succeeded - failed;
  if (failed === outcomes.length) return 'FAILED';
  if (unassessable === outcomes.length) return 'UNASSESSABLE';
  if (failed > 0 || unassessable > 0) return 'PARTIAL';
  return 'COMPLETE';
}

export function reportSummary(outcomes) {
  return {
    totalQuestions: outcomes.length,
    analyzedCount: outcomes.filter((item) => item.status === 'SUCCEEDED').length,
    unassessableCount: outcomes.filter((item) => item.status === 'UNASSESSABLE').length,
    failedCount: outcomes.filter((item) => item.status === 'FAILED').length
  };
}

export function reportHash({ learningSubmissionVersionId, status, generatedAt, summary, outcomes }) {
  // PostgreSQL adds one transaction timestamp when semantic outcomes are
  // persisted. Keep the append-only report hash reproducible from either the
  // pre-persistence Worker objects or their mapped durable representation.
  const semanticOutcomes = outcomes.map(({ createdAt: _persistenceTimestamp, ...outcome }) => outcome);
  return canonicalHash({
    learningSubmissionVersionId,
    status,
    generatedAt: new Date(generatedAt).toISOString(),
    summary,
    outcomes: semanticOutcomes
  });
}

function publicWholeTestAssessment(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return {
    status: value.status,
    evidenceCoverage: value.evidenceCoverage,
    summaryMarkdown: value.summaryMarkdown,
    strengths: value.strengths,
    growthAreas: value.growthAreas,
    priorityActions: value.priorityActions,
    limitations: value.limitations,
    confidence: value.confidence
  };
}

function publicAvailabilityReason(analysis) {
  if (analysis.status === 'FAILED') return 'ANALYSIS_FAILED';
  switch (analysis.outcomeCode) {
    case 'BLANK_REASONING': return 'NO_ATTEMPT';
    case 'QUESTION_UNSCORED': return 'UNSCORED';
    case 'VISUAL_CONTEXT_UNAVAILABLE': return 'VISUAL_CONTEXT_UNAVAILABLE';
    case 'APPROVED_SOLUTIONS_UNAVAILABLE': return 'APPROVED_SOLUTIONS_UNAVAILABLE';
    case 'CONTEXT_UNAVAILABLE': return 'CONTEXT_UNAVAILABLE';
    case 'SCORING_SNAPSHOT_INVALID':
    case 'REASONING_FORMAT_UNSUPPORTED': return 'INVALID_EVIDENCE';
    default: return null;
  }
}

export function publicLearningReport(bundle) {
  const { submission, version, workItem, report, analyses = [] } = bundle;
  const workStatus = workItem?.status;
  const runningStatus = workStatus === 'BLOCKED_CONTEXT'
    ? 'CONTEXT_UNAVAILABLE'
    : (workStatus === 'CANCELLED' || workStatus === 'FAILED' ? 'FAILED' : (workStatus || 'CONTEXT_UNAVAILABLE'));
  const status = report?.status || runningStatus;
  return {
    learningSubmissionId: submission.id,
    version: version.versionNumber,
    status,
    generatedAt: report?.generatedAt || null,
    summary: report ? {
      totalQuestions: report.summary.totalQuestions,
      analyzedCount: report.summary.analyzedCount,
      unassessableCount: report.summary.unassessableCount,
      failedCount: report.summary.failedCount,
      wholeTestAssessment: publicWholeTestAssessment(report.summary.wholeTestAssessment)
    } : {
      totalQuestions: analyses.length || bundle.responses?.length || 0,
      analyzedCount: 0,
      unassessableCount: 0,
      failedCount: 0,
      wholeTestAssessment: null
    },
    questions: analyses
      .sort((left, right) => left.questionNumber - right.questionNumber)
      .map((analysis) => ({
        questionNumber: analysis.questionNumber,
        status: analysis.status,
        evidenceMode: analysis.status === 'SUCCEEDED'
          ? (analysis.reasoningVerdict === 'ANSWER_ONLY' ? 'ANSWER_ONLY' : 'REASONING') : 'NONE',
        availabilityReason: publicAvailabilityReason(analysis),
        reasoningVerdict: analysis.reasoningVerdict,
        summaryMarkdown: analysis.summaryMarkdown,
        strengths: analysis.strengths,
        gaps: analysis.gaps,
        suggestions: analysis.suggestions,
        solutionComparisons: analysis.solutionComparisons.map(({ methodTags, alignment, analysisMarkdown }) => ({
          methodTags,
          alignment,
          analysisMarkdown
        })),
        confidence: analysis.confidence
      }))
  };
}
