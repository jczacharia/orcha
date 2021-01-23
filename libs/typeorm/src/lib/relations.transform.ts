import { IExactQuery, IQuery, ORCHA_PAGINATE } from '@orcha/common';

export function createTypeormRelationsArray<T, Q extends IQuery<T>>(query: IExactQuery<T, Q>) {
  const arr: string[] = [];

  const parse = (q: any, root: string) => {
    for (const k in q) {
      if (typeof q[k] === 'object' && k !== ORCHA_PAGINATE) {
        const newRoot = `${root}${root ? '.' : ''}${k}`;
        arr.push(newRoot);
        parse(q[k], newRoot);
      }
    }
    return arr;
  };

  return parse(query, '');
}
