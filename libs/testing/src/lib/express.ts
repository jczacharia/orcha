/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { Type } from '@angular/core';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ClientOperation, ClientOrchestration } from '@orcha/angular';
import {
  IExactQuery,
  IOperation,
  IOrchestration,
  IParser,
  IQuery,
  ORCHA,
  ORCHA_DTO,
  ORCHA_FILES,
  ORCHA_QUERY,
  ORCHA_TOKEN,
  __ORCHA_OPERATIONS,
  __ORCHA_ORCHESTRATION_NAME,
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

export type ITestOperation<
  T,
  DTO extends Record<string, any> | undefined = undefined,
  F extends File | File[] | undefined = undefined
> = DTO extends undefined
  ? F extends undefined
    ? <Q extends IQuery<T>>(query: IExactQuery<T, Q>, token: string) => Promise<ITestResponse<IParser<T, Q>>>
    : <Q extends IQuery<T>>(
        query: IExactQuery<T, Q>,
        token: string,
        _: undefined,
        files: F
      ) => Promise<ITestResponse<IParser<T, Q>>>
  : F extends undefined
  ? <Q extends IQuery<T>>(
      query: IExactQuery<T, Q>,
      token: string,
      dto: DTO
    ) => Promise<ITestResponse<IParser<T, Q>>>
  : <Q extends IQuery<T>>(
      query: IExactQuery<T, Q>,
      token: string,
      dto: DTO,
      files: F
    ) => Promise<ITestResponse<IParser<T, Q>>>;

export type ITestOrchestration<O extends IOrchestration> = {
  [K in keyof O]: O[K] extends IOperation<infer T, infer Props, infer F>
    ? ITestOperation<T, Props, F>
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
    const testOperation = async (query: object, token?: string, dto?: object, files?: File | File[]) => {
      const req = request(app.getHttpServer()).post(`/${ORCHA}/${name}/${operation}`);

      if (query) req.field(ORCHA_QUERY, JSON.stringify(query));
      req.field(ORCHA_TOKEN, token ?? '');
      if (dto) req.field(ORCHA_DTO, JSON.stringify(dto));

      if (Array.isArray(files)) {
        files.forEach((file) => req.attach(ORCHA_FILES, Buffer.from('dummy'), file.name));
      } else if (files) {
        req.attach(ORCHA_FILES, Buffer.from('dummy'), files.name);
      }

      const res = await req;
      return res.error ? { ...res, error: res.body.message } : res;
    };
    operations[operation] = testOperation;
  }
  return operations;
}
