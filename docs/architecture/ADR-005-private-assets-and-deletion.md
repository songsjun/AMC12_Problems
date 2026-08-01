# ADR-005: Bound private uploads and make deletion auditable

## Status

Accepted for the single-host first release

## Context

Text and audio uploads introduce private student data, disk exhaustion, path traversal, malformed-media, provider-retention, and deletion risks. The current 64 KiB JSON request limit is not an upload design, while adding object storage is unnecessary for the current single-host deployment.

## Decision

Store uploads through a private-file adapter outside every source and static root, using random storage keys, directory mode `0700`, file mode `0600`, streaming hashes, and atomic completion. Production wiring supplies the actual deployment roots rather than relying on the process working directory, and startup fails if either tree contains the other. Nginx also denies the conventional private-upload URL prefix as defense in depth. User filenames are display metadata only. The first release limits a batch to 10 files, each text file to 256 KiB, each audio file to 25 MiB and 60 minutes, and aggregate uploaded bytes to 100 MiB per batch. Media type and duration are verified server-side.

Active-batch limits do not replace abuse and cost controls. Authenticated request counts, accepted upload bytes, and admitted provider work use separate per-student, PostgreSQL-backed fixed windows so changing IP address or API process cannot reset them. Provider work is additionally bounded globally. Rejections are `429` with a bounded `Retry-After`. Transcription claims choose fairly across students rather than draining one student's queue first.

The service reserves quota before accepting bytes and stops new uploads/work at configured global byte quota, disk high-watermark, or minimum-free-space thresholds. Partial, aborted, over-limit, and validation-failed files are cleaned atomically. A reconciler inventories orphan/partial files and expired reservations; cleanup backlog and disk watermark emit alerts. Global disk pressure is a visible retryable service state, not an unchecked write failure.

Raw audio is excluded from backups and deleted after a normalized transcript is durably stored, with a 24-hour local cleanup target. The AssemblyAI transcript is then deleted and its deletion status retried/audited; provider deletion may take longer and remains visibly pending. Normalized student evidence copied into a committed learning-submission version, reports, and chat remain until the student deletes the learning submission or an administrator applies the documented account-retention policy. Encrypted backups containing normalized data expire no later than 30 days after deletion. Broad release additionally requires documented provider region, transcript TTL, and model-training opt-out settings plus student-facing consent/retention copy.

Deleting a draft or processing batch cancels it and removes its private source evidence. Deleting the transient source assets of an already committed batch does not rewrite or delete the immutable learning version, report, or tutor history that the student explicitly confirmed; the product labels this action `delete uploaded source files`, not `delete learning record`. A separate learning-submission deletion tombstones the derived answers, reasoning, reports, and tutor threads while preserving the official score. These two actions use distinct UI copy, endpoints, idempotency scopes, and audit events.

Deletion is `ACTIVE -> DELETE_REQUESTED -> LOCAL_PURGED -> PROVIDER_DELETE_PENDING -> PROVIDER_DELETION_EVIDENCED -> COMPLETE` for a known transcript ID. An upload with no transcript ID instead enters `PROVIDER_RETENTION_PENDING`; this state can reach `COMPLETE` only after an independent operator/provider confirmation, never from time passage alone. Tombstoning immediately blocks reads and new work. Work items carry a deletion generation and may persist a result only while `deleted_at IS NULL` and the generation still matches, preventing stale workers from resurrecting data. Transcript deletion records the provider delete receipt. For upload-only ambiguity, the conservative configured not-before produces only `PROVIDER_RETENTION_WINDOW_ELAPSED` and a `MANUAL_VERIFICATION_REQUIRED` job. The UI distinguishes that account-policy observation from provider deletion evidence. `COMPLETE` means the private local blobs and database bodies within the selected deletion scope are purged, all configured provider evidence requirements are independently satisfied, and only minimal non-content audit metadata and expiring backup copies remain under the published policy. For `delete uploaded source files`, that scope expressly excludes the separately retained, student-confirmed learning version described above.

Every non-idempotent provider boundary has a durable, pre-call `MAY_HAVE_DELIVERED` intent. The worker cannot upload without an explicitly verified account-retention profile. Its not-before includes the full upload-request timeout, the profile-specific policy delay, and explicit processing slack. An upload whose response is lost has no provider identifier: local audio is purged immediately, while the upstream state remains pending through window elapsed until independent confirmation. AssemblyAI documents that asynchronous retention varies by account configuration and AWS TTL deletion after expiry may lag by hours or days; a timer is therefore not hard-deletion evidence. Before transcript submission, the known unique upload URL and call time are durable. If the submission response is lost, the worker does not resubmit: it pages the provider's transcript-list API, matches the exact upload URL, durably adopts every matching transcript ID, and deletes it. Absence from a list response is not physical-deletion evidence; unresolved ambiguity remains pending and alerts an operator. This deliberately favors a visible retention backlog over falsely declaring deletion complete.

Deleting a LearningSubmission never deletes or changes its referenced official submission, official answer snapshots, or deterministic score.

Upload routes receive explicit nginx/Fastify limits; ordinary JSON routes keep the existing 64 KiB limit. Before a multi-host deployment, the local adapter must be replaced by shared private object storage with the same contract.

The AssemblyAI adapter uses only a configured exact HTTPS API host, uploads bytes through the provider upload endpoint, rejects redirects, and validates returned upload URLs against an exact host/path allowlist. It never fetches a user-provided URL. The first release has no provider webhook.

## Consequences

- The first release stays operationally simple and supports crash-safe cleanup.
- A host failure can make an upload unavailable before transcription unless backups are added; the UI must expose failure/retry rather than fabricate a report.
- Batch deployment must use encrypted local storage and a dedicated service identity, or explicitly document acceptance of the same-UID process trust boundary before real student data.
- Account-wide quotas, consent copy, and jurisdiction-specific retention still require product/legal policy before broad release.
