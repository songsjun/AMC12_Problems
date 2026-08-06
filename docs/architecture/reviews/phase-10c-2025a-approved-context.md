# Phase 10c: 2025A approved multi-solution context

## Outcome

The exact form `amc12-2025-a@archive-2026-08-03-r3` now has a protected v2
approved-context artifact. Every question has two explicitly reviewed
solutions and one active independent authority receipt per decision. Six
operator-original supplements fill missing independent methods for Q9, Q11,
Q13, Q20, Q21, and Q25 without changing the published form, prompt, choices,
answer key, scoring policy, content hash, or manifest hash.

The protected lineage hashes are:

- supplement set: `0b292c71dd46bfc0f5381b2e30a182fa5fffd3fdb46ce4915085ec588923964b`;
- supplemented candidate set: `13eafdacd4690ce8e2f5848a540cadb170c75a00400f13525e32157ffd4070a6`;
- review decisions: `410498e904fbbcf0b590e54ee9278f54b02a5ec31a8baf634621d9e876c63fb0`;
- approval receipts: `9ed6a43697076775a556b187bb95e97ae463b23eab9843d06ffb48b8c7cdec0f`;
- compiled approved archive: `9e711adca61aab4bd241e77c0a474d78d82ed533ff6251b8aa1440c1eb8865f6`.

The files and build scripts live under the owner-only protected review root,
not Git. Directories are mode `0700`; JSON/Markdown artifacts are mode `0600`.
This review record stores hashes and dispositions, not solution bodies.

## Review evidence

Four mathematical review roles covered Q1-8, Q9-16, Q17-22, and Q23-25.
The supplement author, each mathematical reviewer, the authorizing operator,
and release authority use disjoint identities. The authority consumed an
already validated decision set and issued exactly 50 active receipts.

An independent final reviewer reported:

- all production Python validators passed with zero errors;
- in-memory recompilation exactly equalled the protected compiled JSON;
- the independent API validator accepted 1 form, 25 questions, and 50 approved
  solutions;
- all 50 body/source/question hashes matched their candidates, each decision
  had exactly one active receipt, and each question had exactly two decisions
  and compiled solutions;
- none of the quarantined Q5 `solution-008`, Q12 `solution-007`, or Q23
  `solution-003` candidates was selected;
- independent calculation verified the six supplements: Q9 `5/3`, Q11
  orthocenter `(2,3)`, Q13 three valid omissions out of 78, Q20 volume 528,
  Q21 `(a,k,m)=(2,4,2)`, and Q25 exactly 13 ordered pairs from an exhaustive
  `35 x 35` root-multiset enumeration;
- the 111-test content pipeline passed.

Q25 remains exactly `isScored=false`, `correctOption=null`, and
`acceptedOptions=[]`; its mathematical count is not used to repair or infer a
frozen key. The form still has 24 scored questions and maximum score 144.

## Visual availability and reflection

The compiler reports 19 context-ready and 6 unavailable questions. Q5, Q8,
Q10, Q14, Q20, and Q24 contain archived SVG references in their frozen prompts,
so `visualContext.required=true` and `modelAvailable=false`. No nonvisual
question is unavailable. All six still retain reviewed solutions for future
use, but the current text-only inference contract must not pretend that the
model saw a diagram.

This makes the first 2025A report partial by design. Q25 is deterministic
unscored work, and the six visual questions are deterministic unavailable work;
provider-backed analysis can cover at most the 18 scored, nonvisual questions,
with fully blank responses still handled locally. Supporting all 25 requires a
new governed image-context contract and a new exact release decision, not a
flag change or manual bypass.

The receipt mechanism is a hash-bound owner-controlled allowlist, not a digital
signature, and distinct opaque identities on one host do not prove external
organizational separation. These are accepted local-governance limits and are
not represented as independent third-party certification.
