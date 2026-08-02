// Priority is a latency preference, not an unbounded starvation right. Once a
// work item has been ready this long, class-local selection becomes FIFO.
export const AI_PRIORITY_STARVATION_MAX_WAIT_MS = 120_000;

export function compareAiWorkWithinKind(left, right, now) {
  const nowMs = new Date(now).getTime();
  const leftAvailable = new Date(left.availableAt).getTime();
  const rightAvailable = new Date(right.availableAt).getTime();
  const leftOverdue = nowMs - leftAvailable >= AI_PRIORITY_STARVATION_MAX_WAIT_MS;
  const rightOverdue = nowMs - rightAvailable >= AI_PRIORITY_STARVATION_MAX_WAIT_MS;
  if (leftOverdue !== rightOverdue) return leftOverdue ? -1 : 1;
  const leftCreated = new Date(left.createdAt).getTime();
  const rightCreated = new Date(right.createdAt).getTime();
  if (leftOverdue) {
    return leftAvailable - rightAvailable || leftCreated - rightCreated
      || right.priority - left.priority || left.id.localeCompare(right.id);
  }
  return right.priority - left.priority || leftAvailable - rightAvailable
    || leftCreated - rightCreated || left.id.localeCompare(right.id);
}
