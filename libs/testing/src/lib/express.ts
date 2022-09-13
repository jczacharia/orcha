/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { Type } from '@angular/core';
import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  ClientController,
  ClientOperation,
  IController,
  IOperation,
  IParser,
  IQuery,
  ORCHA,
  OrchaResponse,
  ORCHA_DTO,
  ORCHA_FILES,
  ORCHA_TOKEN,
  __ORCHA_CONTROLLER_NAME,
  __ORCHA_OPERATIONS,
} from '@orcha/common';
import 'multer';
import * as request from 'supertest';

type ITestResponse<T> = Omit<request.Response, 'body'> & {
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

export type ITestOperation<T, Q extends IQuery<T>, D = null, F extends File[] | null = null> = (
  token: string,
  ...args: D extends null
    ? F extends null
      ? []
      : [dto: null, files: F]
    : F extends null
    ? [dto: D]
    : [dto: D, files: F]
) => Promise<ITestResponse<OrchaResponse<IParser<T, Q>>>>;

export type ITestController<O extends IController> = {
  [K in keyof O]: O[K] extends IOperation<infer T, infer Q, infer D, infer F>
    ? ITestOperation<T, Q, D, F>
    : never;
};

/**
 * Create a Test Controller from an Express NestJS application.
 */
export function createNestjsTestController<O extends Type<IController>>(
  app: INestApplication,
  controller: O
): ITestController<InstanceType<O>> {
  const name = controller.prototype[__ORCHA_CONTROLLER_NAME];
  const operations = controller.prototype[__ORCHA_OPERATIONS];
  const opsKeys = Object.keys(operations);

  if (!name) {
    throw new Error(
      `No controller controller name found for controller with names of "${opsKeys.join(
        ', '
      )}"\nDid you remember to add @TestController(<name here>)?`
    );
  }

  for (const operation of opsKeys) {
    const testOperation = async (token: string, dto: Record<keyof unknown, unknown>, files: File[]) => {
      const req = request.default(app.getHttpServer()).post(`/${ORCHA}/${name}/${operation}`);

      req.field(ORCHA_TOKEN, token ?? '');

      if (dto) {
        req.field(ORCHA_DTO, JSON.stringify(dto));
      }

      if (files) {
        files.forEach((file) => req.attach(ORCHA_FILES, Buffer.from('dummy'), file.name));
      }

      const res = await req;
      return res.error ? { ...res, error: res.body.message } : res;
    };
    operations[operation] = testOperation;
  }
  return operations;
}
