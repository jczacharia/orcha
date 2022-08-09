import { IExactQuery, IQuery, ORCHA_PAGINATE } from '@orcha/common';

export function createMikroOrmRelationsArray<T, Q extends IQuery<T>>(query: IExactQuery<T, Q>) {
  const populate: any[] = [];

  const parse = (q: any, root: string) => {
    for (const k in q) {
      if (typeof q[k] === 'object' && k !== ORCHA_PAGINATE) {
        const newRoot = `${root}${root ? '.' : ''}${k}`;
        populate.push(newRoot);
        parse(q[k], newRoot);
      }
    }
  };

  parse(query, '');

  return populate;
}
