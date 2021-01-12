import { IQuery, ORCHESTRA_PAGINATE } from '@orchestra/common';

export function createTypeormRelationsArray<T>(query: IQuery<T>) {
  const arr: string[] = [];

  const parse = (q: any, root: string) => {
    for (const k in q) {
      if (typeof q[k] === 'object' && k !== ORCHESTRA_PAGINATE) {
        const newRoot = `${root}${root ? '.' : ''}${k}`;
        arr.push(newRoot);
        parse(q[k], newRoot);
      }
    }
    return arr;
  };

  return parse(query, '');
}
