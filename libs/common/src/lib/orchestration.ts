import { ORCHESTRA_DTO, ORCHESTRA_FILES, ORCHESTRA_QUERY, ORCHESTRA_TOKEN } from './constants';
import { IQuery } from './query';

export interface IOperation<
  T,
  DTO extends Record<string, any> | undefined = undefined,
  F extends File | File[] | undefined = undefined
> {
  [ORCHESTRA_QUERY]: IQuery<T>;
  [ORCHESTRA_DTO]: DTO;
  [ORCHESTRA_TOKEN]: string;
  [ORCHESTRA_FILES]?: F;
}

export type IOrchestration = Record<keyof unknown, IOperation<unknown>>;
