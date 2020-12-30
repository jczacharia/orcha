import { KIRTAN_DTO, KIRTAN_QUERY, KIRTAN_TOKEN } from './constants';
import { IQuery } from './query';

export interface ISubscription<T, Dto = undefined> {
  [KIRTAN_QUERY]: IQuery<T>;
  [KIRTAN_DTO]?: Dto;
  [KIRTAN_TOKEN]?: string;
}

export type IGateway = Record<keyof unknown, ISubscription<unknown, unknown>>;
