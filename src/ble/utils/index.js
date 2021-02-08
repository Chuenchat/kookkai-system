exports.sequencePromises = (promises) => (
    promises.reduce((promise, promiseFunction) => (
      promise.then(() => promiseFunction())
    ), Promise.resolve())
  );
  