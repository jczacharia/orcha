/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpEvent } from '@angular/common/http';
import { IOperation, IOrchestration, IParser, IQuery, OrchaResponse } from '@orcha/common';
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
  ? OrchaResponse<AllDatesToStrings<IParser<T, Q>>>
  : HttpEvent<OrchaResponse<AllDatesToStrings<IParser<T, Q>>>>;

export type IExtractOperationReturnSchema<R> = R extends IOperation<infer T, infer Q, any, any>
  ? AllDatesToStrings<IParser<T, Q>>
  : unknown;

type AllDatesToStrings<T> = {
  [K in keyof T]: NonNullable<T[K]> extends Date
    ? (null extends T[K] ? string | null : string) | (undefined extends T[K] ? string | undefined : string)
    : T[K] extends object
    ? AllDatesToStrings<T[K]>
    : T[K];
};

/**
 * Implements a Client Orchestration from an `IOrchestration`.
 */
export type IClientOrchestration<O extends IOrchestration> = {
  [K in keyof O]: O[K] extends IOperation<infer T, infer Q, infer D, infer F>
    ? IClientOperation<T, Q, D, F>
    : never;
};
