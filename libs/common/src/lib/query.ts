import { KIRTAN_LIMIT, KIRTAN_PAGE, KIRTAN_PAGINATE } from './constants';
import { IAnyRelation } from './relations';

export type IQuery<Q> = Q extends Array<infer A> ? IRootQuery<A> & IPaginate : IRootQuery<Q>;
export type IRootQuery<Q> = Q extends Array<infer A> ? IQuery1<A> : IQuery1<Q>;

export type IQuery1<Q> = {
  // For whatever reason `Required<infer _>` works.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  [K in keyof Q]?: Q[K] extends IAnyRelation<Q[K], Required<infer _>> ? true : IRootQuery<Q[K]>;
};

export interface IPaginate {
  [KIRTAN_PAGINATE]?: {
    [KIRTAN_PAGE]: number;
    [KIRTAN_LIMIT]: number;
  };
}
