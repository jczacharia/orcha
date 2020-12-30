import { KIRTAN_DTO, KIRTAN_QUERY, KIRTAN_TOKEN } from './constants';
import { IQuery } from './query';

export interface IOperation<T, DTO = undefined> {
  [KIRTAN_QUERY]: IQuery<T>;
  [KIRTAN_DTO]?: DTO;
  [KIRTAN_TOKEN]?: string;
}

export type IOrchestration = Record<keyof unknown, IOperation<unknown, unknown>>;
