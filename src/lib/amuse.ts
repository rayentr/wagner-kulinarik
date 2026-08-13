type ServedFn = () => void;

let served = false;
const waiters = new Set<ServedFn>();

export function isServed() {
  return served;
}

export function onServed(fn: ServedFn) {
  if (served) {
    fn();
    return () => {};
  }
  waiters.add(fn);
  return () => {
    waiters.delete(fn);
  };
}

export function serve() {
  if (served) return;
  served = true;
  waiters.forEach((fn) => fn());
  waiters.clear();
}
