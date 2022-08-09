/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { Type } from '@angular/core';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ClientGateway, ClientOperation, ClientOrchestration, ClientSubscription } from '@orcha/angular';
import {
  IExactQuery,
  IGateway,
  IOperation,
  IOrchestration,
  IPaginate,
  IParser,
  IQuery,
  ISubscription,
  ISubscriptionResult,
  ORCHA,
  ORCHA_DTO,
  ORCHA_FILES,
  ORCHA_PAGINATE,
  ORCHA_QUERY,
  ORCHA_TOKEN,
  subscriptionChannelErrorRoute,
  __ORCHA_GATEWAY_NAME,
  __ORCHA_OPERATIONS,
  __ORCHA_ORCHESTRATION_NAME,
  __ORCHA_SUBSCRIPTIONS,
} from '@orcha/common';
import 'multer';
import { Observable, Subject } from 'rxjs';
import * as io from 'socket.io-client';
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
export const TestGateway = ClientGateway;
export const TestSubscription = ClientSubscription;

export type ITestOperation<
  T,
  D extends Record<string, unknown> | null = null,
  F extends File | File[] | null = null
> = <Q extends IQuery<T>>(
  query: IExactQuery<T, Q>,
  token: string,
  ...args: D extends null
    ? F extends null
      ? []
      : [dto: null, files: F]
    : F extends null
    ? [dto: D]
    : [dto: D, files: F]
) => Promise<ITestResponse<IParser<T, Q>>>;

export type ITestOrchestration<O extends IOrchestration> = {
  [K in keyof O]: O[K] extends IOperation<infer T, infer D, infer F> ? ITestOperation<T, D, F> : never;
};

export type ITestSubscription<T, D> = <Q extends IQuery<T>>(
  query: Q,
  token: string,
  ...dto: D extends null ? [] : [dto: D]
) => Observable<ISubscriptionResult<T, Q>>;

export type ITestGateway<O extends IGateway> = {
  [K in keyof O]: O[K] extends ISubscription<infer T, infer D> ? ITestSubscription<T, D> : never;
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
    const testOperation = async (
      query: Record<keyof unknown, unknown>,
      token: string,
      dto: Record<keyof unknown, unknown>,
      paginate: IPaginate,
      files: File[]
    ) => {
      const req = request.default(app.getHttpServer()).post(`/${ORCHA}/${name}/${operation}`);

      req.field(ORCHA_QUERY, JSON.stringify(query));
      req.field(ORCHA_TOKEN, token ?? '');

      if (dto) {
        req.field(ORCHA_DTO, JSON.stringify(dto));
      }
      if (paginate) {
        req.field(ORCHA_PAGINATE, JSON.stringify(paginate));
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

export function createNestjsTestGateway<G extends Type<IGateway>>(
  app: INestApplication,
  gateway: G
): ITestGateway<InstanceType<G>> {
  const gatewayName = gateway.prototype[__ORCHA_GATEWAY_NAME]; // aka namespace
  const wsUrl = `http://localhost:80/${gatewayName}`;
  const subscriptions = gateway.prototype[__ORCHA_SUBSCRIPTIONS];
  const subKeys = Object.keys(subscriptions);

  if (subKeys.length > 0) {
    const socket = (io as any).io(wsUrl);

    socket.on('exception', (d: unknown) => {
      console.error(d);
    });

    socket.on('connect', () => {
      console.log('Orcha Testing Websockets Connected.');
    });

    for (const channel of subKeys) {
      const subject = new Subject<any>();

      socket.on(channel, (d: unknown) => {
        subject.next(d);
      });

      socket.on(subscriptionChannelErrorRoute(channel), (d: unknown) => {
        subject.error(d);
      });

      const clientSubscription: ITestSubscription<{}, {}> = (
        query: Record<string, unknown>,
        token: string,
        dto: unknown
      ) => {
        const body: ISubscription<unknown, any> = {
          [ORCHA_DTO]: dto,
          [ORCHA_QUERY]: query,
          [ORCHA_TOKEN]: token,
        };
        socket.emit(channel, body);
        return subject.asObservable();
      };

      subscriptions[channel] = clientSubscription;
    }
  }

  return subscriptions;
}
