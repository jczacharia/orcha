import { IQuery, KIRTAN_PAGINATE } from '@kirtan/common';

export function createTypeormRelationsArray<T>(query: IQuery<T>) {
  if (Array.isArray(query)) {
    query = query[0];
  }

  const arr: string[] = [];

  const removeNextToLast = (str: string) => {
    const chars: number[] = [];
    for (let i = 0; i < str.length; i++) {
      if (str.charAt(i) === '.') {
        chars.push(i);
      }
    }
    const index = chars[chars.length - 2];
    return str.substring(index + 1);
  };

  const concat = (k: string, n: number) => {
    let str = '';
    if (n > 1) str += `${arr[arr.length - 1]}.`;
    str += k;
    str = removeNextToLast(str);
    arr.push(str);
  };

  let iter = 0;
  const parse = (q: IQuery<T>) => {
    iter++;
    for (const k in q) {
      if (q.hasOwnProperty(k)) {
        const qk = q[k] as any;
        if (Array.isArray(qk)) {
          concat(k, iter);
          parse((qk[0] as any) as IQuery<T>);
          iter--;
        } else if (typeof qk === 'object' && k !== KIRTAN_PAGINATE) {
          concat(k, iter);
          parse((qk as any) as IQuery<T>);
          iter--;
        }
      }
    }
  };

  parse(query);

  return arr;
}
