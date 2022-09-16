import { IExactQuery, IQuery } from '@orcha/common';

export function createMikroOrmPopulateArray<T, Q extends IQuery<T>>(query: IExactQuery<T, Q>) {
  const populate: any[] = [];

  const parse = (q: any, root: string) => {
    for (const k in q) {
      if (typeof q[k] === 'object') {
        const newRoot = `${root}${root ? '.' : ''}${k}`;
        populate.push(newRoot);
        parse(q[k], newRoot);
      }
    }
  };

  parse(query, '');

  return populate;
}
