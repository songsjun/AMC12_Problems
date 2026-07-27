/**
 * Polling is deliberately idempotent: every candidate is row-locked by the
 * service, which recomputes server time before creating the one preliminary
 * deadline snapshot. Multiple API replicas may run this safely.
 */
export function startDeadlineWorker({ service, intervalMs, logger = console }) {
  let stopped = false;
  let running = false;

  const tick = async () => {
    if (stopped || running) return;
    running = true;
    try {
      const summary = await service.sweepDeadlines();
      if (summary.failures > 0) logger.error?.({ summary }, 'AMC deadline sweep completed with failures');
    } catch (error) {
      logger.error?.({ err: error }, 'AMC deadline sweep failed');
    } finally {
      running = false;
    }
  };

  const timer = setInterval(() => { void tick(); }, intervalMs);
  timer.unref?.();
  void tick();
  return {
    tick,
    stop() {
      stopped = true;
      clearInterval(timer);
    }
  };
}
