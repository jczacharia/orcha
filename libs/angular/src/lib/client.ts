/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpEvent } from '@angular/common/http';
import { IController, IOperation, IParserSerialized, IQuery, OrchaResponse } from '@orcha/common';
import { Observable } from 'rxjs';

/**
 * Implements a Client Operation from an `IOperation`.
 */
export type IClientOperation<T, Q extends IQuery<T>, D = null, F extends File | File[] | null = null> = (
  ...args: D extends null
    ? F extends null
      ? []
      : [dto: null, files: F]
    : F extends null
    ? [dto: D]
    : [dto: D, files: F]
) => Observable<IResponse<T, Q, F>>;

type IResponse<T, Q, F> = F extends null
  ? OrchaResponse<IParserSerialized<T, Q>>
  : HttpEvent<OrchaResponse<IParserSerialized<T, Q>>>;

/**
 * Implements a Client Controller from an `IController`.
 */
export type IClientController<O extends IController> = {
  [K in keyof O]: O[K] extends IOperation<infer T, infer Q, infer D, infer F>
    ? IClientOperation<T, Q, D, F>
    : never;
};
