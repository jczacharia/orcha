import { KIRTAN_LIMIT, KIRTAN_PAGE, KIRTAN_PAGINATE } from './constants';
import { IAnyRelation } from './relations';

export type IQuery<Q> = Q extends Array<infer A> ? IRootQuery<A> & IPaginate : IRootQuery<Q>;
type IRootQuery<Q> = Q extends Array<infer A> ? IIQuery<A> : IIQuery<Q>;

type IIQuery<Q> = {
  [K in keyof Q]?: Q[K] extends IAnyRelation<Q[K], infer _> ? true : IRootQuery<Q[K]>;
};

export interface IPaginate {
  [KIRTAN_PAGINATE]?: {
    [KIRTAN_PAGE]: number;
    [KIRTAN_LIMIT]: number;
  };
}
