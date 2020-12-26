import { Observable } from 'rxjs';
import { KIRTAN_DTO, KIRTAN_QUERY, KIRTAN_TOKEN } from './constants';
import { IParser } from './parser';
import { IQuery } from './query';

type ServerOperationReturnType<T> = T | Promise<T> | Observable<T>;

export interface IOperation<T, Dto = undefined> {
  [KIRTAN_QUERY]: IQuery<T>;
  [KIRTAN_DTO]?: Dto;
  [KIRTAN_TOKEN]?: string;
}

export type IOrchestration = Record<keyof unknown, IOperation<unknown, unknown>>;

export type IServerOperation<T, Dto = undefined> = (
  query: IQuery<T>,
  dto: Dto,
  auth?: string
) => ServerOperationReturnType<IParser<T, IQuery<T>>>;

export type IClientOperation<T, Dto = undefined> = <Q extends IQuery<T>>(
  query: Q,
  dto?: Dto
) => Observable<IParser<T, Q>>;
