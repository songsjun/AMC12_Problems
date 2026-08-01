# ADR-003: Govern multi-solution question contexts explicitly

## Status

Accepted

## Context

The source corpus often contains multiple community-written solution sections, including videos, jokes, incomplete methods, alternate problem variants, and editorial notes. Structural extraction can identify candidates, but it cannot establish mathematical correctness, pedagogical quality, or the right to reuse the text in AI prompts.

## Decision

Build multi-solution candidates in a new private artifact without changing the existing public/private form manifests or first-solution behavior. Extraction statuses are only `candidate` and `quarantined`; neither means approved. A later review record must explicitly set each eligible solution to `approved` and record reviewer, timestamp, source hash, quality flags, method tags, and content-rights status.

Only approved solutions from an approved, versioned question-context set may enter analysis or tutor prompts. Quarantined, rejected, unreviewed, hash-mismatched, or rights-unknown content remains unavailable to students and models. Approval is never inferred from a heading keyword or a model response.

The currently released student-facing first solution is not automatically an approved AI reference. It follows the same explicit correctness, pedagogy, and rights review. If an exact form revision has no approved context set, final scoring still succeeds and its learning submission enters `CONTEXT_UNAVAILABLE`; its durable intent is non-dispatchable rather than a retrying provider job. Reports/chat remain unavailable until an approved set is attached and a new analysis intent is created. Raw source Markdown is never used as a fallback.

## Consequences

- The system can compile and review the corpus incrementally without changing released forms.
- Multiple-solution coverage remains incomplete until humans approve it; the product must show the actual approved reference count.
- Source changes invalidate the affected approval through its pinned hash.
- Full-corpus extraction success is engineering evidence, not evidence that every extracted solution is correct or reusable.
