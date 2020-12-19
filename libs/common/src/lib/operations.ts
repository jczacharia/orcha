import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { KIRTAN_DTO, KIRTAN_QUERY } from './constants';
import { IPagination } from './pagination';
import { IParser } from './parser';
import { IQuery } from './query';

type PromiseOrObservable<T> = Promise<T> | Observable<T>;

export interface IOperation<T, Dto = undefined> {
  [KIRTAN_QUERY]: IQuery<T>;
  [KIRTAN_DTO]?: Dto;
}
export interface ISubscription<T, Dto = undefined> {
  [KIRTAN_QUERY]: IQuery<T>;
  [KIRTAN_DTO]?: Dto;
}

export type IOperations = Record<keyof unknown, IOperation<unknown, unknown>>;
export type ISubscriptions = Record<keyof unknown, ISubscription<unknown, unknown>>;

export type IServerOperation<T, Dto = undefined> = (
  query: IQuery<T>,
  dto: Dto
) => T extends Array<infer A> ? PromiseOrObservable<IPagination<A> | A[]> : PromiseOrObservable<T>;
export type IServerSubscription<T, Dto = undefined> = (
  socket: Socket,
  query: IQuery<T>,
  dto: Dto
) => Promise<void>;

export type IClientOperation<T, Dto = undefined> = <Q extends IQuery<T>>(
  query: Q,
  dto?: Dto
) => Observable<IParser<T, Q>>;
export interface IClientSubscription<T, Dto = undefined> extends IClientOperation<T, Dto> {}
