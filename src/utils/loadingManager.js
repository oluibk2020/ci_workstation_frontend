let activeRequests = 0;
const listeners = new Set();

function notify() {
  const loading = activeRequests > 0;
  listeners.forEach((listener) => listener(loading));
}

export const loadingManager = {
  start() {
    activeRequests += 1;
    notify();
  },
  stop() {
    activeRequests = Math.max(0, activeRequests - 1);
    notify();
  },
  subscribe(listener) {
    listeners.add(listener);
    listener(activeRequests > 0);
    return () => listeners.delete(listener);
  },
};
