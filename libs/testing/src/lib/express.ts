/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import 'multer';

import { Type } from '@angular/core';
import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  ClientController,
  ClientOperation,
  IController,
  IExactQuery,
  IOperationEvent,
  IOperationFilesUpload,
  IOperationFileUpload,
  IOperationPaginate,
  IOperationQuery,
  IOperationSimple,
  IPaginateQuery,
  IPagination,
  IParserSerialized,
  IQuery,
  ORCHA,
  OrchaMetadata,
  OrchaOperationType,
  OrchaProps,
  OrchaResponse,
} from '@orcha/common';
import { Observable } from 'rxjs';
import * as supertest from 'supertest';

type ITestResponse<T> = Omit<supertest.Response, 'body'> & {
  body: T;
  statusCode: HttpStatus;
  error?: any;
};

/**
 * Decorates a Test Controller's method with a Test Operation.
 *
 * @example
 * ```ts
 * @TestController(OrchaTodoExampleAppControllers.user)
 * class UserController implements ITestController<IUserController> {
 *   @TestOperation()
 *   signUp!: ITestController<IUserController>['signUp'];
 *   @TestOperation()
 *   login!: ITestController<IUserController>['login'];
 *   @TestOperation()
 *   getProfile!: ITestController<IUserController>['getProfile'];
 * }
 * ```
 */
export const TestOperation = ClientOperation;

/**
 * Decorates a class to be a Test Controller.
 *
 * @example
 * ```ts
 * @TestController(OrchaTodoExampleAppControllers.user)
 * class UserController implements ITestController<IUserController> {
 *   @TestOperation()
 *   signUp!: ITestController<IUserController>['signUp'];
 *   @TestOperation()
 *   login!: ITestController<IUserController>['login'];
 *   @TestOperation()
 *   getProfile!: ITestController<IUserController>['getProfile'];
 * }
 * ```
 */
export const TestController = ClientController;

export type ITestOperationSimple<T, Q extends IQuery<T>, D extends Record<string, any> | null = null> = (
  token: string,
  ...args: D extends null ? [] : [dto: D]
) => Promise<ITestResponse<OrchaResponse<IParserSerialized<T, Q>>>>;

export type ITestOperationFileUpload<T, Q extends IQuery<T>, D extends Record<string, any> | null = null> = (
  token: string,
  file: File,
  ...args: D extends null ? [] : [dto: D]
) => Promise<ITestResponse<OrchaResponse<IParserSerialized<T, Q>>>>;

export type ITestOperationFilesUpload<T, Q extends IQuery<T>, D extends Record<string, any> | null = null> = (
  token: string,
  files: File[],
  ...args: D extends null ? [] : [dto: D]
) => Promise<ITestResponse<OrchaResponse<IParserSerialized<T, Q>>>>;

export type ITestOperationPaginate<T, Q extends IQuery<T>, D extends Record<string, any> | null = null> = (
  token: string,
  paginate: IPaginateQuery,
  ...args: D extends null ? [] : [dto: D]
) => Promise<ITestResponse<OrchaResponse<IPagination<IParserSerialized<T, Q>>>>>;

export type ITestOperationEventSubscriber<
  T,
  Q extends IQuery<T>,
  D extends Record<string, string | number> | null = null
> = (token: string, ...args: D extends null ? [] : [dto: D]) => Observable<IParserSerialized<T, Q>>;

export type ITestOperationQuery<T, D extends Record<string, string | number> | null = null> = <
  Q extends IQuery<T>
>(
  token: string,
  query: IExactQuery<T, Q>,
  ...args: D extends null ? [] : [dto: D]
) => Promise<ITestResponse<OrchaResponse<IParserSerialized<T, Q>>>>;

/**
 * Implements a Client Controller from an `IController`.
 */
export type ITestController<O extends IController> = {
  [K in keyof O]: O[K] extends IOperationSimple<infer T, infer Q, infer D>
    ? ITestOperationSimple<T, Q, D>
    : O[K] extends IOperationFileUpload<infer T, infer Q, infer D>
    ? ITestOperationFileUpload<T, Q, D>
    : O[K] extends IOperationFilesUpload<infer T, infer Q, infer D>
    ? ITestOperationFilesUpload<T, Q, D>
    : O[K] extends IOperationPaginate<infer T, infer Q, infer D>
    ? ITestOperationPaginate<T, Q, D>
    : O[K] extends IOperationEvent<infer T, infer Q, infer D>
    ? ITestOperationEventSubscriber<T, Q, D>
    : O[K] extends IOperationQuery<infer T, infer D>
    ? ITestOperationQuery<T, D>
    : never;
};

/**
 * Create a Test Controller from an Express NestJS application.
 */
export function createNestjsTestController<O extends Type<IController>>(
  app: INestApplication,
  controller: O
): ITestController<InstanceType<O>> {
  const controllerName = controller.prototype[OrchaMetadata.CONTROLLER_NAME];
  const controllerMethods = controller.prototype[OrchaMetadata.CONTROLLER_METHODS];
  const controllerMethodEntries = Object.entries(controllerMethods) as [string, OrchaOperationType][];

  if (!controllerName) {
    throw new Error(
      `No controller controller name found for controller with names of "${controllerMethodEntries.join(
        ', '
      )}"\nDid you remember to add @TestController(<name here>)?`
    );
  }

  for (const [methodName, type] of controllerMethodEntries) {
    const url = `/${ORCHA}/${controllerName}/${methodName}`;

    switch (type) {
      case 'simple':
        {
          controllerMethods[methodName] = createTestOperationSimple(app, url);
        }
        break;

      case 'file-upload':
        {
          // controllerMethods[methodName] = createTestOperationFileUpload(app, url);
        }
        break;

      case 'files-upload':
        {
          // controllerMethods[methodName] = createTestOperationFilesUpload(app, url);
        }
        break;

      case 'paginate':
        {
          controllerMethods[methodName] = createTestOperationPaginate(app, url);
        }
        break;

      case 'event':
        {
          // controllerMethods[methodName] = createTestOperationEventSubscriber(app, url);
        }
        break;

      case 'query':
        {
          controllerMethods[methodName] = createTestOperationQuery(app, url);
        }
        break;
    }
  }
  return controllerMethods;
}

function createTestOperationSimple<T, Q extends IQuery<T>, D extends Record<string, any>>(
  app: INestApplication,
  url: string
): ITestOperationSimple<T, Q, D> {
  return async (token: string, dto?: D) => {
    const req = supertest
      .default(app.getHttpServer())
      .post(url)
      .set(OrchaProps.TOKEN, token || '');

    const body = dto ? { [OrchaProps.DTO]: JSON.stringify(dto) } : {};

    req.send(body);
    const res = await req;
    return (res.error ? { ...res, error: res.body.message } : res) as ITestResponse<
      OrchaResponse<IParserSerialized<T, Q>>
    >;
  };
}

function createTestOperationPaginate<T, Q extends IQuery<T>, D extends Record<string, any>>(
  app: INestApplication,
  url: string
): ITestOperationPaginate<T, Q, D> {
  return async (token: string, paginate: IPaginateQuery, dto?: D) => {
    const req = supertest
      .default(app.getHttpServer())
      .post(url)
      .set(OrchaProps.TOKEN, token || '');

    const body = dto
      ? { [OrchaProps.DTO]: JSON.stringify(dto), [OrchaProps.PAGINATE]: paginate }
      : { [OrchaProps.PAGINATE]: paginate };

    req.send(body);
    const res = await req;
    return (res.error ? { ...res, error: res.body.message } : res) as ITestResponse<
      OrchaResponse<IPagination<IParserSerialized<T, Q>>>
    >;
  };
}

function createTestOperationQuery<T, D extends Record<string, any>>(
  app: INestApplication,
  url: string
): ITestOperationQuery<T, D> {
  return async <Q extends IQuery<T>>(token: string, query: IExactQuery<T, Q>, dto?: D) => {
    const req = supertest
      .default(app.getHttpServer())
      .post(url)
      .set(OrchaProps.TOKEN, token || '');

    const body = dto
      ? { [OrchaProps.DTO]: JSON.stringify(dto), [OrchaProps.QUERY]: query }
      : { [OrchaProps.QUERY]: query };

    req.send(body);
    const res = await req;
    return (res.error ? { ...res, error: res.body.message } : res) as ITestResponse<
      OrchaResponse<IParserSerialized<T, Q>>
    >;
  };
}
