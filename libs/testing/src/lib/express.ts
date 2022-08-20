/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { Type } from '@angular/core';
import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  ClientOperation,
  ClientOrchestration,
  IOperation,
  IOrchestration,
  IParser,
  IQuery,
  ORCHA,
  OrchaResponse,
  ORCHA_DTO,
  ORCHA_FILES,
  ORCHA_TOKEN,
  __ORCHA_OPERATIONS,
  __ORCHA_ORCHESTRATION_NAME
} from '@orcha/common';
import 'multer';
import * as request from 'supertest';

type ITestResponse<T> = Omit<request.Response, 'body'> & {
  body: T;
  statusCode: HttpStatus;
  error?: any;
};

/**
 * Decorates a Test Orchestration's method with a Test Operation.
 *
 * @example
 * ```ts
 * @TestOrchestration(OrchaTodoExampleAppOrchestrations.user)
 * class UserOrchestration implements ITestOrchestration<IUserOrchestration> {
 *   @TestOperation()
 *   signUp!: ITestOrchestration<IUserOrchestration>['signUp'];
 *   @TestOperation()
 *   login!: ITestOrchestration<IUserOrchestration>['login'];
 *   @TestOperation()
 *   getProfile!: ITestOrchestration<IUserOrchestration>['getProfile'];
 * }
 * ```
 */
export const TestOperation = ClientOperation;

/**
 * Decorates a class to be a Test Orchestration.
 *
 * @example
 * ```ts
 * @TestOrchestration(OrchaTodoExampleAppOrchestrations.user)
 * class UserOrchestration implements ITestOrchestration<IUserOrchestration> {
 *   @TestOperation()
 *   signUp!: ITestOrchestration<IUserOrchestration>['signUp'];
 *   @TestOperation()
 *   login!: ITestOrchestration<IUserOrchestration>['login'];
 *   @TestOperation()
 *   getProfile!: ITestOrchestration<IUserOrchestration>['getProfile'];
 * }
 * ```
 */
export const TestOrchestration = ClientOrchestration;

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

export type ITestOrchestration<O extends IOrchestration> = {
  [K in keyof O]: O[K] extends IOperation<infer T, infer Q, infer D, infer F>
    ? ITestOperation<T, Q, D, F>
    : never;
};

/**
 * Create a Test Orchestration from an Express NestJS application.
 */
export function createNestjsTestOrchestration<O extends Type<IOrchestration>>(
  app: INestApplication,
  orchestration: O
): ITestOrchestration<InstanceType<O>> {
  const name = orchestration.prototype[__ORCHA_ORCHESTRATION_NAME];
  const operations = orchestration.prototype[__ORCHA_OPERATIONS];
  const opsKeys = Object.keys(operations);

  if (!name) {
    throw new Error(
      `No orchestration orchestration name found for orchestration with names of "${opsKeys.join(
        ', '
      )}"\nDid you remember to add @TestOrchestration(<name here>)?`
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
