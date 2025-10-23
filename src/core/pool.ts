function pLimit(concurrency: number) {
  const queue: VoidFunction[] = [];
  let active = 0;

  const next: VoidFunction = () => {
    active--;
    queue.shift()?.();
  };

  return async <T>(fn: () => Promise<T>): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      const run: VoidFunction = () => {
        active++;
        fn()
          .then((v) => {
            resolve(v);
            next();
          })
          .catch((e) => {
            reject(e);
            next();
          });
      };

      if (active < concurrency) return run();
      else queue.push(run);
    });
}

export { pLimit };
