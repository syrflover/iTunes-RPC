import * as F from 'nodekell';

export const uniq = <T>(f: (elem: T) => any, iter: F.Iter<T>) =>
    F.run(iter, F.distinctBy(f), F.collect);

export const random = <T>(a: T[]) => F.sample(a);
