/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { Type } from '@angular/core';
import { ClientOperation, ClientOperations } from '@kirtan/angular';
import {
  IOperation,
  IOperations,
  IParser,
  IQuery,
  KIRTAN,
  KIRTAN_DTO,
  KIRTAN_QUERY,
  __KIRTAN_OPERATIONS,
  __KIRTAN_OPERATIONS_NAME,
} from '@kirtan/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { IncomingHttpHeaders } from 'http';
import { Response as HttpResponse } from 'light-my-request';

type ITestResponse<T> = Omit<HttpResponse, 'body'> & { body: T };

export const TestOperation = ClientOperation;
export const TestOperations = ClientOperations;

export type ITestOperation<T, Props = undefined> = <Q extends IQuery<T>>(
  query: Q,
  props: Props,
  // eslint-disable-next-line @typescript-eslint/ban-types
  headers?: IncomingHttpHeaders
) => Promise<ITestResponse<IParser<T, Q>>>;

export type ITestOperations<O extends IOperations> = {
  [K in keyof O]: O[K] extends IOperation<infer T, infer Props> ? ITestOperation<T, Props> : never;
};

function createTestResponse<T>(res: HttpResponse) {
  return {
    ...res,
    body: res.body ? JSON.parse(res.body) : '',
  } as ITestResponse<T>;
}

export function createNestjsFastifyTestOperations<O extends Type<IOperations>>(
  app: NestFastifyApplication,
  operations: O
): ITestOperations<InstanceType<O>> {
  const name = operations.prototype[__KIRTAN_OPERATIONS_NAME];
  const ops = operations.prototype[__KIRTAN_OPERATIONS];
  const keys = Object.keys(ops);

  if (!name) {
    throw new Error(
      `No operations orchestration name found for operations with names of "${keys.join(
        ', '
      )}"\nDid you remember to add @TestOperations(<name here>)?`
    );
  }

  for (const operation of keys) {
    const testOperation = async (query: object, props: object, headers: IncomingHttpHeaders) => {
      const body: IOperation<object, object> = { [KIRTAN_DTO]: props, [KIRTAN_QUERY]: query };
      const res = await app.inject({
        method: 'POST',
        url: `/${KIRTAN}/${name}/${operation}`,
        payload: body,
        headers,
      });
      return createTestResponse(res);
    };
    ops[operation] = testOperation;
  }
  return ops;
}
