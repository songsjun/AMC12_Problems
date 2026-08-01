# ADR-005: Bound private uploads and make deletion auditable

## Status

Accepted for the single-host first release

## Context

Text and audio uploads introduce private student data, disk exhaustion, path traversal, malformed-media, provider-retention, and deletion risks. The current 64 KiB JSON request limit is not an upload design, while adding object storage is unnecessary for the current single-host deployment.

## Decision

Store uploads through a private-file adapter outside static roots, using random storage keys, directory mode `0700`, file mode `0600`, streaming hashes, and atomic completion. User filenames are display metadata only. The first release limits a batch to 10 files, each text file to 256 KiB, each audio file to 25 MiB and 60 minutes, and aggregate uploaded bytes to 100 MiB per batch. Per-student active-batch and rate limits are enforced separately. Media type and duration are verified server-side.

The service reserves quota before accepting bytes and stops new uploads/work at configured global byte quota, disk high-watermark, or minimum-free-space thresholds. Partial, aborted, over-limit, and validation-failed files are cleaned atomically. A reconciler inventories orphan/partial files and expired reservations; cleanup backlog and disk watermark emit alerts. Global disk pressure is a visible retryable service state, not an unchecked write failure.

Raw audio is excluded from backups and deleted after a normalized transcript is durably stored, with a 24-hour local cleanup target. The AssemblyAI transcript is then deleted and its deletion status retried/audited; provider deletion may take longer and remains visibly pending. Normalized student evidence, reports, and chat remain until the student deletes the learning submission or an administrator applies the documented account-retention policy. Encrypted backups containing normalized data expire no later than 30 days after deletion. Broad release additionally requires documented provider region, transcript TTL, and model-training opt-out settings plus student-facing consent/retention copy.

Deletion is `ACTIVE -> DELETE_REQUESTED -> LOCAL_PURGED -> PROVIDER_DELETE_PENDING -> PROVIDER_DELETION_EVIDENCED -> COMPLETE`. Tombstoning immediately blocks reads and new work. Work items carry a deletion generation and may persist a result only while `deleted_at IS NULL` and the generation still matches, preventing stale workers from resurrecting data. Transcript deletion records the provider delete receipt. If uploaded audio has no per-object physical-deletion receipt, completion records the applicable documented/contractual TTL evidence and its elapsed deadline; the UI distinguishes request, provider evidence, and claimed physical deletion. `COMPLETE` means private local blobs and database bodies are purged, all configured provider evidence requirements are satisfied, and only minimal non-content audit metadata and expiring backup copies remain under the published policy.

Deleting a LearningSubmission never deletes or changes its referenced official submission, official answer snapshots, or deterministic score.

Upload routes receive explicit nginx/Fastify limits; ordinary JSON routes keep the existing 64 KiB limit. Before a multi-host deployment, the local adapter must be replaced by shared private object storage with the same contract.

The AssemblyAI adapter uses only a configured exact HTTPS API host, uploads bytes through the provider upload endpoint, rejects redirects, and validates returned upload URLs against an exact host/path allowlist. It never fetches a user-provided URL. The first release has no provider webhook.

## Consequences

- The first release stays operationally simple and supports crash-safe cleanup.
- A host failure can make an upload unavailable before transcription unless backups are added; the UI must expose failure/retry rather than fabricate a report.
- Batch deployment must use encrypted local storage and a dedicated service identity, or explicitly document acceptance of the same-UID process trust boundary before real student data.
- Account-wide quotas, consent copy, and jurisdiction-specific retention still require product/legal policy before broad release.
