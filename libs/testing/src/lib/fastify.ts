/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { Type } from '@angular/core';
import { ClientOperation, ClientOrchestration } from '@kirtan/angular';
import {
  IOperation,
  IOrchestration,
  IParser,
  IQuery,
  KIRTAN,
  KIRTAN_DTO,
  KIRTAN_QUERY,
  KIRTAN_TOKEN,
  __KIRTAN_OPERATIONS,
  __KIRTAN_ORCHESTRATION_NAME,
} from '@kirtan/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Response as HttpResponse } from 'light-my-request';

type ITestResponse<T> = Omit<HttpResponse, 'body'> & { body: T };

export const TestOperation = ClientOperation;
export const TestOrchestration = ClientOrchestration;

export type ITestOperation<T, Props = undefined> = <Q extends IQuery<T>>(
  query: Q,
  props: Props,
  token?: string
) => Promise<ITestResponse<IParser<T, Q>>>;

export type ITestOrchestration<O extends IOrchestration> = {
  [K in keyof O]: O[K] extends IOperation<infer T, infer Props> ? ITestOperation<T, Props> : never;
};

function createTestResponse<T>(res: HttpResponse) {
  return {
    ...res,
    body: res.body ? JSON.parse(res.body) : '',
  } as ITestResponse<T>;
}

export function createNestjsFastifyTestOrchestration<O extends Type<IOrchestration>>(
  app: NestFastifyApplication,
  orchestration: O
): ITestOrchestration<InstanceType<O>> {
  const name = orchestration.prototype[__KIRTAN_ORCHESTRATION_NAME];
  const operations = orchestration.prototype[__KIRTAN_OPERATIONS];
  const opsKeys = Object.keys(operations);

  if (!name) {
    throw new Error(
      `No orchestration orchestration name found for orchestration with names of "${opsKeys.join(
        ', '
      )}"\nDid you remember to add @TestOrchestration(<name here>)?`
    );
  }

  for (const operation of opsKeys) {
    const testOperation = async (query: object, props: object, token?: string) => {
      const body: IOperation<object, object> = { [KIRTAN_DTO]: props, [KIRTAN_QUERY]: query };
      const res = await app.inject({
        method: 'POST',
        url: `/${KIRTAN}/${name}/${operation}`,
        payload: { ...body, [KIRTAN_TOKEN]: token },
      });
      return createTestResponse(res);
    };
    operations[operation] = testOperation;
  }
  return operations;
}
