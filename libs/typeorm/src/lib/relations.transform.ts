import { IQuery, KIRTAN_PAGINATE } from '@kirtan/common';

export function createTypeormRelationsArray<T>(query: IQuery<T>) {
  const arr: string[] = [];

  const concat = (key: string, iter: number) => {
    let str = '';
    if (iter > 1) {
      str += `${arr[arr.length - 1]}.`;
    }
    str += key;
    arr.push(str);
  };

  let iter = 0;
  const parse = (q: IQuery<T>) => {
    iter++;
    for (const key in q) {
      // TODO any
      const qk = (q as any)[key];
      if (typeof qk === 'object' && key !== KIRTAN_PAGINATE) {
        concat(key, iter);
        parse(qk as IQuery<T>);
        iter--;
      }
    }
  };

  parse(query);

  return arr;
}
