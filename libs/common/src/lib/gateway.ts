import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { KIRTAN_DTO, KIRTAN_QUERY, KIRTAN_TOKEN } from './constants';
import { IParser } from './parser';
import { IQuery } from './query';

export interface ISubscription<T, Dto = undefined> {
  [KIRTAN_QUERY]: IQuery<T>;
  [KIRTAN_DTO]?: Dto;
  [KIRTAN_TOKEN]?: string;
}

export type IGateway = Record<keyof unknown, ISubscription<unknown, unknown>>;

export type IServerSubscription<T, Dto = undefined> = (
  socket: Socket,
  query: IQuery<T>,
  dto: Dto,
  auth?: string
) => Promise<void>;

export type IClientSubscription<T, Dto = undefined> = <Q extends IQuery<T>>(
  query: Q,
  dto?: Dto
) => Observable<IParser<T, Q>>;
