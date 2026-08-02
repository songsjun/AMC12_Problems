# Phase 6h: runtime restart and regression acceptance

## Accepted scope and outcome

This acceptance revalidated the AMC learning lifecycle after restarting the
actual service and after restarting an isolated API/Worker/Gateway stack. It
separates three claims that must not be conflated:

1. The production Practice API was safely migrated and restarted on the new
   code while its existing core data remained intact.
2. The exercised text-batch and learning-review lifecycle (interactive answer
   and reasoning, analysis, text-batch confirmation, history, and Tutor) works
   across real HTTP, PostgreSQL, private file storage, the real Worker process,
   and the isolated AMC Gateway process when only the final paid-model
   transport is replaced by a deterministic local fake. Audio/provider behavior
   is covered separately by adapter and Worker regression tests, not a live
   external call.
3. The production Worker and dedicated AMC inference Gateway are **not yet
   deployed**, so this acceptance does not claim that production AI calls are
   enabled.

The production API restart succeeded. Its launchd PID changed from `38391` to
`95881`, its launch count changed from 4 to 5, and health recovered with HTTP
200 on the first successful post-restart probe. The restarted process remained
healthy throughout the post-restart browser and API checks. The retained log
shows about 183 ms from the new process's listening event to that health
request, but is not evidence for the complete old-process-to-new-process outage
duration.

## Safe restart evidence

The preflight first reproduced the new production startup contract without
touching the active listener. It found that the protected API environment did
not name a private upload root, so a blind restart would have failed closed and
caused an outage. The non-secret setting
`AMC12_PRIVATE_UPLOAD_ROOT=/var/lib/kapy/amc12-private-uploads` was added to the
protected API environment and the root was created as `ss:staff`, mode `0700`.
The API environment still contains zero AssemblyAI, model-provider, or
inference-token keys. The root contains the expected empty `objects/`
directory and no files.

A same-configuration canary then started on loopback port 18090, applied all 13
migrations, served health, and exposed the new authenticated routes before it
was stopped cooperatively. The production migration ledger moved from 4 to 13
files, ending at `013_ai_dispatch_fairness.sql`. Core row counts were unchanged
across migration and restart:

| Aggregate | Before | After |
| --- | ---: | ---: |
| students | 2 | 2 |
| attempts | 5 | 5 |
| submissions | 6 | 6 |

After restart, `/api/amc12/learning-history`, the attempt reasoning route, and
the batch route returned authenticated-boundary HTTP 401 instead of the old
process's route-level 404. Tutor remained an intentional 404 because the
production Tutor release flag is still off. Health returned 200 directly and
through the workspace nginx proxy; the private source path returned 404.

## Real process end-to-end evidence

A fresh PostgreSQL database and an isolated `0700` private root were populated
with one synthetic 25-question form, one approved context set, and one
synthetic student. The following real processes were started:

- `practice-api/src/server.js` on loopback port 18091;
- `practice-api/src/learning-review/worker-main.js` with Tutor enabled;
- the isolated AMC inference Gateway on loopback port 14110.

The Gateway used its actual request validation, admission control, structured
response validation, and HTTP contracts. Only its final OpenAI fetch was
replaced by a deterministic fake. The Worker used its real dispatcher,
PostgreSQL leases/fences, inference clients, and persistence paths.

The authenticated HTTP workflow proved:

- a per-question answer and reasoning note persisted, finalization scored 42
  points, and immutable learning version 1 was created;
- the Worker generated a PARTIAL 25-question report: question 1 was analyzed
  through the Gateway and the 24 questions without reasoning were explicitly
  UNASSESSABLE locally;
- question 1 preserved objective scoring, student evidence, strengths, gaps,
  suggestions, and comparisons against both approved solutions;
- learning history returned the submission and version;
- a question-scoped Tutor thread accepted a student message as QUEUED and then
  became SUCCEEDED with two persisted messages and one assistant reply; its
  frozen question context exposed two approved solution references;
- a text batch moved through DRAFT, NORMALIZED, PROCESSING, and
  NEEDS_CONFIRMATION; the model-derived mapping could not commit without the
  explicit student confirmation;
- confirmation committed immutable version 2 with
  `MAPPED_QUESTIONS_ONLY`, one mapped/correct question, and 6 of 6 points;
- version 2 produced a COMPLETE analysis report with one analyzed question and
  two solution comparisons;
- history then contained `FINAL_COMMIT` and `BATCH_COMMIT` versions together.

The first synthetic batch deliberately returned the wrong model-response
schema from the fake. The real Gateway rejected it, the batch durably became
FAILED with `INVALID_PROVIDER_RESPONSE`, and no invalid mapping committed. The
fake was corrected from the contract, the isolated Gateway was restarted, and
a new batch completed. This negative run is evidence that the validation
boundary failed closed rather than evidence of a product failure.

## Crash/restart persistence evidence

After the successful flows, the isolated stack was stopped in dependency order
(Worker, API, Gateway), both HTTP listeners were confirmed closed, and it was
started in dependency order (Gateway, API, Worker). The principal PIDs changed:

| Process | Before full restart | After full restart |
| --- | ---: | ---: |
| Gateway listener | 98743 | 99022 |
| API listener | 97923 | 99028 |
| Worker | 97948 | 99045 |

The same signed HTTP session cookie, retained in the synthetic curl cookie jar,
still authenticated after restart. The same finalized result, score 42, two
learning versions, PARTIAL/COMPLETE reports, COMMITTED batch with 6 points,
SUCCEEDED Tutor request, and two Tutor messages were read back over HTTP.
Durable queue inspection showed:

- analysis work: one PARTIAL and one SUCCEEDED;
- batch work: one expected negative-test FAILED and one SUCCEEDED;
- Tutor work: one SUCCEEDED;
- two reports, 26 per-question analysis outcomes, and one batch result;
- zero expired RUNNING leases.

The isolated processes were then stopped cooperatively. The fresh database,
private files (two synthetic blobs), cookie jar, and temporary identifiers were
deleted. The production database and private root were not used by this
synthetic workflow. Production health remained 200 after cleanup.

The exact cleanup targets were the database
`amc12_runtime_verify_20260802`, private root
`/var/tmp/amc12-runtime-verify-20260802`, cookie jar
`/var/tmp/amc12-runtime-cookie-20260802`, and four same-prefix temporary ID
files for the attempt, submission, thread, and batch. Cleanup verification
observed no private root, zero matching PostgreSQL databases, no cookie jar,
closed ports 14110/18091, no isolated Worker process, and production health
200.

The raw command output, process command lines, and before/after SQL results
exist in the execution record for this acceptance but were deliberately not
copied into the repository because they include ephemeral identifiers and
synthetic session material. After cleanup, an independent reviewer can verify
the absence of the test environment and the current production state, but
cannot replay the exact historical PIDs or independently reconstruct the
pre-migration production snapshot from this Markdown file alone. The stated
before counts are contemporaneous observations, not a separately signed or
immutable evidence artifact. A reusable redacted acceptance harness and
machine-readable result manifest remain follow-up work.

## Regression evidence

- Practice API without a test database: 250 tests, 239 passed, 11 explicit
  PostgreSQL skips, 0 failed.
- Each PostgreSQL file on its own fresh database: analysis-v2 migration 3/3,
  Tutor migration 3/3, Tutor PostgreSQL store/HTTP/fencing 7/7, and the complete
  PostgreSQL smoke 1/1.
- Focused text/audio/provider/deployment suite: 49/49. This includes mixed text
  and audio, durable transcription, provider cleanup, retention gates,
  starvation/capacity, batch analysis, launchd semantics, abort, timeout, and
  redaction behavior.
- Student UI after production restart: 54/54 with real headless Chrome
  MathJax/injection smoke. Direct, portal, and public HTTPS mounts initialized
  the anonymous login view; their HTML/JS hashes matched the working tree.
- Content and approved multi-solution compiler: 106/106.
- Isolated AMC inference Gateway: 8 files / 90 tests and TypeScript typecheck.
- The complete reference `aops_calculus` workspace typechecked. Its original
  API (54), Web (3), generic AI Gateway (57), extractor (1), and AMC Gateway
  (90) tests all passed, including the user's unrelated dirty generic-Gateway
  worktree files.
- Production direct/proxy/UI/public endpoints returned 200; anonymous auth
  remained 401; source-tree exposure remained 404; CSP, frame denial, nosniff,
  and no-cache headers remained present.
- The already-running reference AOPS API health/readiness endpoints, generic
  Gateway health endpoint, and Web listener remained HTTP 200 after the AMC
  restart. Their services were not restarted because the generic Gateway has
  unrelated user worktree changes and is not the dedicated AMC Gateway.
- `git diff --check` passed. The existing untracked
  `practice-api/start-with-pg-wait.sh` was not read, modified, staged, or
  removed.

## Critical reflection and remaining production gates

This is strong evidence for application behavior and persistence, not proof of
external-provider availability or pedagogical correctness. No live AssemblyAI
or OpenAI call was made. The AssemblyAI credential disclosed in the original
request must be revoked and rotated before any production audio canary. The
account-specific retention/ZDR/DPA controls still require independent
verification.

The production Worker environment, logs, LaunchDaemon, and dedicated AMC
Gateway on port 4110 are absent. The generic AOPS Gateway on 4100 is a different
service and was intentionally not treated as the AMC Gateway. Production batch
decomposition, analysis, and Tutor therefore remain gated even though their
full isolated process workflow passed.

The gate is currently operational rather than a complete API-surface gate:
after the API restart, the authenticated batch intake routes and UI are loaded
even though their consumers are absent. A production student could therefore
create and upload a batch that remains in PROCESSING instead of receiving a
report. No production student batch was created during this acceptance, and
the feature must not be announced as available in this state. Either deploy and
canary the dedicated Gateway and Worker before student use, or add a coordinated
batch release flag that rejects/hides intake until those dependencies are
ready. Objective final scoring remains independent of this AI backlog.

There is also a deployment drift that should not be hidden. The installed API
plist invokes the user's untracked PostgreSQL-wait wrapper and has an effective
five-second exit timeout; the reviewed repository plist invokes Node directly
and specifies 30 seconds. The wrapper was not read under this task's worktree
boundary; its filename suggests a PostgreSQL-readiness intent, but its behavior
was not independently verified. Replacing the installed file could therefore
discard an unreviewed local startup behavior, so this acceptance deliberately
did not overwrite it. The correct follow-up is to bring that startup behavior
under review and tests, integrate the required readiness behavior into the
committed deployment contract, and retain the bounded 30-second cooperative
shutdown.

Finally, both HTTP health endpoints are liveness-only. A 200 does not prove
database readiness, provider connectivity, token/model agreement, governance,
or queue progress. Production enablement needs a synthetic authenticated
canary with a fixed budget, readiness and queue SLOs, installed Gateway/Worker
supervision, and alerting on oldest-ready work and expired leases.
