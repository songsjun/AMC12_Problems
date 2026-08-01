#!/usr/bin/env node
import { loadConfig } from '../src/config.js';
import { runMigrations } from '../src/migrate.js';
import { PostgresStore } from '../src/postgres-store.js';

const [action, id, versionOrReason, contextOrNothing, reasonOrNothing, ...extra] = process.argv.slice(2);
const authorityId = process.env.AMC12_OPEN_REVIEW_OPERATOR_ID;

function usage() {
  console.error('Usage:');
  console.error('  npm run manage-open-review -- publish <form-id> <form-version> <context-set-uuid> <reason-code>');
  console.error('  npm run manage-open-review -- supersede <release-uuid> <reason-code>');
  console.error('  npm run manage-open-review -- revoke <release-uuid> <reason-code>');
}

if (typeof authorityId !== 'string' || authorityId.length < 3 || authorityId.length > 128) {
  throw new Error('AMC12_OPEN_REVIEW_OPERATOR_ID must identify the authenticated operator authority.');
}

let operation;
if (action === 'publish' && id && versionOrReason && contextOrNothing && reasonOrNothing && !extra.length) {
  operation = (store, now) => store.publishOpenReviewRelease({
    formId: id,
    formVersion: versionOrReason,
    contextSetId: contextOrNothing,
    authorityId,
    reasonCode: reasonOrNothing,
    now
  });
} else if (['supersede', 'revoke'].includes(action) && id && versionOrReason
    && contextOrNothing === undefined && reasonOrNothing === undefined && !extra.length) {
  operation = (store, now) => store.transitionOpenReviewRelease({
    releaseId: id,
    nextStatus: action === 'supersede' ? 'SUPERSEDED_VALID' : 'REVOKED',
    authorityId,
    reasonCode: versionOrReason,
    now
  });
} else {
  usage();
  process.exitCode = 2;
}

if (operation) {
  const config = loadConfig();
  if (!config.databaseUrl) throw new Error('AMC12_DATABASE_URL is required.');
  const store = new PostgresStore({ connectionString: config.databaseUrl });
  try {
    await runMigrations(store.pool);
    const release = await operation(store, new Date());
    if (!release) throw new Error('Open review release was not found.');
    console.log(JSON.stringify({
      id: release.id,
      formId: release.formId,
      formVersion: release.formVersion,
      contextSetId: release.contextSetId,
      releaseHash: release.releaseHash,
      status: release.status,
      stateRevision: release.stateRevision,
      updatedAt: release.updatedAt
    }, null, 2));
  } finally {
    await store.close();
  }
}
