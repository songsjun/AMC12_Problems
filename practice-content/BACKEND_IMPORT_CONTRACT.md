# Private manifest → practice API import contract

`amc-practice-private-form-v1` is the canonical content artifact. The backend
adapter may rename fields for its storage/API model, but must preserve the
meaning and persist its integrity fields. This is intentionally an adapter,
not a second content format.

| Canonical private v1 | API/import model | Rule |
| --- | --- | --- |
| `id` | `formId` | Stable contest/form identity. |
| `version` | `version` | Non-empty immutable revision. The unique history key is `(formId, version)`. |
| `title` | `title` | Copy unchanged. |
| `durationSeconds` | `durationMs` | Multiply by 1000; 4500 becomes 4,500,000. |
| `publicationStatus` | `published` | `approved` maps to `true`. `test-only` defaults to `false`; see development-publish eligibility below. |
| `scoringPolicy.correct` | `scoring.correctPoints` | Copy numeric value. |
| `scoringPolicy.blank` | `scoring.blankPoints` | Copy numeric value. |
| `scoringPolicy.incorrect` | `scoring.incorrectPoints` | Copy numeric value. |
| `scoringPolicy.questionCount`, `maxScore` | same names | Copy unchanged. |
| question `promptMarkdown`, `choices` | question prompt/choices | Copy unchanged. |
| question `correctOption`, `solutionMarkdown`, `sourceRef` | protected server-side fields | Never include in an in-progress student payload. |
| `contentHash`, `manifestHash`, `questionBundleHash` | form-revision audit fields | Store and verify; do not silently recompute/change input content. |

## Required import policy

1. Validate the private manifest and canonical hashes before normalization.
2. Reject every form except `publicationStatus: "approved"` by default.
3. A local/test import may set an explicit `allowTestOnly` switch for a
   `test-only` synthetic fixture. That grants only
   `developmentPublishEligible: true`; it does **not** automatically publish
   the form. A separate explicit `allowDevPublish` switch may make it visible
   in a non-production development environment. Production must not enable
   either switch and must never return a test-only form in form-list queries.
4. Enforce uniqueness/immutability of `(formId, version)`: importing a different
   `manifestHash` for an existing pair is an error, not an update.
5. Serve the public projection before final submission. The protected fields
   above are available only to scoring/final-results code.

## Executable fixture contract

`tests/test_backend_adapter_contract.py` maps the checked-in synthetic private
manifest through the documented shape and asserts the exact duration, status,
scoring, version, question-count, private-field behavior, and two-step
development visibility gate. The backend implementation should mirror this
test against its own `normalizeManifest` adapter. It is not permission to
import or publish the synthetic fixture in production.
