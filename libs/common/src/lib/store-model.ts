import { IParser } from './parser';
import { IQuery } from './query';

export const createStoreModelFromQuery = <T>() => <Q extends IQuery<T>>(q: Q) => q;

export type IStoreModel<T, Q> = T extends Array<infer A> ? IParser<A, Q> : IParser<T, Q>;
