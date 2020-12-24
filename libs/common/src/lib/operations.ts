import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { KIRTAN_TOKEN, KIRTAN_DTO, KIRTAN_QUERY } from './constants';
import { IParser } from './parser';
import { IQuery } from './query';

type ServerOperationReturnType<T> = T | Promise<T> | Observable<T>;

export interface IOperation<T, Dto = undefined> {
  [KIRTAN_QUERY]: IQuery<T>;
  [KIRTAN_DTO]?: Dto;
  [KIRTAN_TOKEN]?: string;
}
export interface ISubscription<T, Dto = undefined> {
  [KIRTAN_QUERY]: IQuery<T>;
  [KIRTAN_DTO]?: Dto;
  [KIRTAN_TOKEN]?: string;
}

export type IOperations = Record<keyof unknown, IOperation<unknown, unknown>>;
export type ISubscriptions = Record<keyof unknown, ISubscription<unknown, unknown>>;

export type IServerOperation<T, Dto = undefined> = (
  query: IQuery<T>,
  dto: Dto,
  auth?: string
) => ServerOperationReturnType<IParser<T, IQuery<T>>>;
export type IServerSubscription<T, Dto = undefined> = (
  socket: Socket,
  query: IQuery<T>,
  dto: Dto,
  auth?: string
) => Promise<void>;

export type IClientOperation<T, Dto = undefined> = <Q extends IQuery<T>>(
  query: Q,
  dto?: Dto
) => Observable<IParser<T, Q>>;
export type IClientSubscription<T, Dto = undefined> = IClientOperation<T, Dto>;
