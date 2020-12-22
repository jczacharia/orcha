/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { ClientOperation } from '@kirtan/angular';
import {
  IOperation,
  IOperations,
  IParser,
  IQuery,
  KIRTAN,
  KIRTAN_DTO,
  KIRTAN_QUERY,
  __KIRTAN_OPERATIONS,
} from '@kirtan/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { IncomingHttpHeaders } from 'http';
import { Response as HttpResponse } from 'light-my-request';

type ITestResponse<T> = Omit<HttpResponse, 'body'> & { body: T };

export const TestOperation = ClientOperation;

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

export function createNestjsFastifyTestOperations<O extends IOperations & (new (...args: any) => object)>(
  app: NestFastifyApplication,
  operations: O
): ITestOperations<InstanceType<O>> {
  const o = (operations as any).prototype[__KIRTAN_OPERATIONS];
  for (const operation of Object.keys(o)) {
    const testOperation = async (query: object, props: object, headers: IncomingHttpHeaders) => {
      const body: IOperation<object, object> = { [KIRTAN_DTO]: props, [KIRTAN_QUERY]: query };
      const res = await app.inject({
        method: 'POST',
        url: `/${KIRTAN}/${operation}`,
        payload: body,
        headers,
      });
      return createTestResponse(res);
    };
    o[operation] = testOperation;
  }
  return o;
}
