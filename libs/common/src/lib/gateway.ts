import { ORCHESTRA_DTO, ORCHESTRA_QUERY, ORCHESTRA_TOKEN } from './constants';
import { IQuery } from './query';

export interface ISubscription<T, Dto = undefined> {
  [ORCHESTRA_QUERY]: IQuery<T>;
  [ORCHESTRA_DTO]?: Dto;
  [ORCHESTRA_TOKEN]?: string;
}

export type IGateway = Record<keyof unknown, ISubscription<unknown, unknown>>;
