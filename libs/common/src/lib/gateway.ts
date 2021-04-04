import { ORCHA_FILES } from './constants';
import { IOperation } from './orchestration';

export type ISubscription<T, DTO extends Record<string, any> | undefined = undefined> = Omit<
  IOperation<T, DTO>,
  typeof ORCHA_FILES
>;

export type IGateway = Record<keyof unknown, ISubscription<unknown, any>>;
