/**
 * Simple worker to handle timer ticks reliably in the background
 */
let timerId: ReturnType<typeof setInterval> | null = null;

self.onmessage = (e) => {
  if (e.data === 'start') {
    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => {
      self.postMessage('tick');
    }, 1000);
  } else if (e.data === 'stop') {
    if (timerId) clearInterval(timerId);
    timerId = null;
  }
};
