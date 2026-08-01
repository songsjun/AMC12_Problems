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
  return canonicalHash({
    learningSubmissionVersionId,
    status,
    generatedAt: new Date(generatedAt).toISOString(),
    summary,
    outcomes
  });
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
    summary: report?.summary || {
      totalQuestions: analyses.length || bundle.responses?.length || 0,
      analyzedCount: 0,
      unassessableCount: 0,
      failedCount: 0
    },
    questions: analyses
      .sort((left, right) => left.questionNumber - right.questionNumber)
      .map((analysis) => ({
        questionNumber: analysis.questionNumber,
        status: analysis.status,
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
