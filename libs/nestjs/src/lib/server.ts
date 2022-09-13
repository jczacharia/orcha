import 'multer';

import { IController, IOperation, IParser, IQuery } from '@orcha/common';

/**
 * Implements a Server Operation from an `IOperation`.
 */
export type IServerOperation<T, Q extends IQuery<T>, D = null, F extends File[] | null = null> = (
  token: string,
  ...args: D extends null
    ? F extends null
      ? []
      : [dto: null, files: Express.Multer.File[]]
    : F extends null
    ? [dto: D]
    : [dto: D, files: Express.Multer.File[]]
) => Promise<IParser<T, Q>>;

/**
 * Implements a Server Controller from an `IController`.
 */
export type IServerController<O extends IController> = {
  [K in keyof O]: O[K] extends IOperation<infer T, infer Q, infer D, infer F>
    ? IServerOperation<T, Q, D, F>
    : never;
};
