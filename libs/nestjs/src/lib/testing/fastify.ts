import { NestFastifyApplication } from '@nestjs/platform-fastify';
import {
  IOperation,
  IOperations,
  IParser,
  IQuery,
  KIRTAN_DTO,
  KIRTAN_QUERY,
  __KIRTAN_OPERATIONS,
} from '@kirtan/common';
import { Response as HttpResponse } from 'light-my-request';

type ITestResponse<T> = Omit<HttpResponse, 'body'> & { body: T };

export type ITestOperation<T, Props = undefined> = <Q extends IQuery<T>>(
  query: Q,
  props?: Props
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

export function createNestjsFastifyTestOperations<O extends IOperations & (new (...args: any) => any)>(
  app: NestFastifyApplication,
  operations: O
): ITestOperations<InstanceType<O>> {
  const o = (operations as any).prototype[__KIRTAN_OPERATIONS];
  for (const k of Object.keys(o)) {
    const testOperation = async (query: object, props: object) => {
      const body: IOperation<object, object> = { [KIRTAN_DTO]: props, [KIRTAN_QUERY]: query };
      const res = await app.inject({
        method: 'POST',
        url: `/kirtan/${k}`,
        payload: body,
      });
      return createTestResponse(res);
    };
    o[k] = testOperation;
  }
  return o;
}
