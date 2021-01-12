import { ORCHESTRA_DTO, ORCHESTRA_QUERY, ORCHESTRA_TOKEN } from './constants';
import { IQuery } from './query';

export interface IOperation<T, DTO = undefined> {
  [ORCHESTRA_QUERY]: IQuery<T>;
  [ORCHESTRA_DTO]?: DTO;
  [ORCHESTRA_TOKEN]?: string;
}

export type IOrchestration = Record<keyof unknown, IOperation<unknown, unknown>>;
