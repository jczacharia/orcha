import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { KIRTAN_DTO, KIRTAN_QUERY, __KIRTAN_OPERATIONS_NAME } from './constants';
import { IParser } from './parser';
import { IQuery } from './query';

type ServerOperationReturnType<T> = T | Promise<T> | Observable<T>;

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
) => ServerOperationReturnType<IParser<T, IQuery<T>>>;
export type IServerSubscription<T, Dto = undefined> = (
  socket: Socket,
  query: IQuery<T>,
  dto: Dto
) => Promise<void>;

export type IClientOperation<T, Dto = undefined> = <Q extends IQuery<T>>(
  query: Q,
  dto?: Dto
) => Observable<IParser<T, Q>>;
export type IClientSubscription<T, Dto = undefined> = IClientOperation<T, Dto>;
