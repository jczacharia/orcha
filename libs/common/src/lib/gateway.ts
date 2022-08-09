import { ORCHA_FILES } from './constants';
import { IOperation } from './orchestration';
import { IParser } from './parser';

/**
 * Creates a Subscription model for Socket.io channel endpoints.
 *
 * A Subscription exposes the server to the outside world via Socket.io channel endpoint.
 * An endpoint's route is described as: `/<subscription namespace>/<subscription channel>`.
 * Each Subscription name should describe what the Subscription does.
 * A Subscription can subscribe to a single entity, and array of entities (from an array of ids) or
 * a query that responds with whether entities were updated, created, or deleted.
 *
 * A Subscription's template parameters consist of:
 * @param T The base model/schema/entity to be returned from the Subscription. This can either be a single
 * entity or array of entities.
 * @example Single and multiple.
 * ```ts
 * import { ISubscription } from '@orcha/common';

 * export interface ITodoGateway {
 *   listenOne: ISubscription<Todo>;
 *   listenMany: ISubscription<Todo[]>;
 * }
 * ```
 *
 * @param D Data that describes the operational data of the Subscription. It is null by default.
 * @example Listening to one and multiple Todo entities.
 * ```ts
 * import { IOperation } from '@orcha/common';
 * import { IsString } from 'class-validator';
 * export abstract class ListenOneTodoDto {
 *   @IsString() // This decorator is used on the Socket.io backend to ensure the id property is a string.
 *   id!: string;
 * }
 * interface ITodoGateway {
 *   listenOne: ISubscription<Todo, ListenOneTodoDto>;
 *   listenMany: ISubscription<Todo[], { ids: string[] }>; // Doesn't have to have validation.
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ISubscription<T, D extends Record<string, any> | null = null> = Omit<
  IOperation<T, D>,
  typeof ORCHA_FILES
>;

export interface ISubscriptionResult<T, Q, IdType = string> {
  updated: IParser<T[], Q>;
  created: IParser<T[], Q>;
  deleted: IdType[];
}

/**
 * Creates an Gateway model for a group of domain related Subscriptions under Socket.io channels.
 *
 * An Orchestration groups many Operations under a single parent endpoint.
 * An endpoint looks as follows: `/orcha/<orchestration name>/<operation name>`.
 *
 * @example
 * ```ts
 * export interface ITodoGateway {
 *   listen: ISubscription<Todo>;
 *   listenOne: ISubscription<Todo, TodoListenOneDto>;
 * }
 * ```
 */
export type IGateway = Record<keyof unknown, ISubscription<unknown>>;
