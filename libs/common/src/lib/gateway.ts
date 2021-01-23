import { ORCHA_DTO, ORCHA_QUERY, ORCHA_TOKEN } from './constants';
import { IQuery } from './query';

export interface ISubscription<T, Dto = undefined> {
  [ORCHA_QUERY]: IQuery<T>;
  [ORCHA_DTO]?: Dto;
  [ORCHA_TOKEN]?: string;
}

export type IGateway = Record<keyof unknown, ISubscription<unknown, unknown>>;
