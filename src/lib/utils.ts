import * as F from 'nodekell';

type Iter<T> = Iterable<T> | AsyncIterable<T>;

export const find = <T>(f: (elem: T) => boolean) => async (
  iter: Iter<T | Promise<T>>,
) => {
  for await (const e of iter) {
    const pe = await e;

    if (f(pe)) {
      return pe;
    }
  }
  return;
};

export const uniq = <T>(f: (elem: T) => any, iter: T[]) =>
  F.run(iter, F.distinctBy(f), (e) => F.collect(e));
