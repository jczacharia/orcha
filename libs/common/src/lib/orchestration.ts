import { ORCHA_DTO, ORCHA_FILES, ORCHA_QUERY, ORCHA_TOKEN } from './constants';
import { IQuery } from './query';

export interface IOperation<
  T,
  DTO extends Record<string, any> | undefined = undefined,
  F extends File | File[] | undefined = undefined
> {
  [ORCHA_QUERY]: IQuery<T>;
  [ORCHA_DTO]: DTO;
  [ORCHA_TOKEN]: string;
  [ORCHA_FILES]?: F;
}

export type IOrchestration = Record<keyof unknown, IOperation<unknown>>;
