/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { ORCHA_ID, ORCHA_VIEW } from './constants';

/**
 * Extends your entity model with the Orcha `id` key.
 * All entities used in the Orcha framework must use `id`.
 *
 * @example
 * ```ts
 * interface User extends IOrchaModel<string> {
 *   email: string;
 *   password: string;
 * }
 * ```
 */
export type IOrchaModel<IdType extends string | number> = { [ORCHA_ID]: IdType };

/**
 * Creates a One-to-One relationship with another entity.
 *
 * @example
 * ```ts
 * interface User extends IOrchaModel<string> {
 *   privateData: IOneToOne<'user', UserPrivate>;
 * }
 *
 * interface UserPrivate extends IOrchaModel<string> {
 *   user: IOneToOne<'privateData', User>;
 * }
 * ```
 */
export type IOneToOne<Relation, SelfKey extends keyof Relation> = {
  [K in keyof Relation]: Relation[K];
};

/**
 * Creates a One-to-Many relationship with another entity.
 *
 * @example
 * ```ts
 * interface User extends IOrchaModel<string> {
 *   posts: IOneToMany<'user', Post>;
 * }
 *
 * interface Post extends IOrchaModel<string> {
 *   user: IManyToOne<'posts', User>;
 * }
 * ```
 */
export type IOneToMany<Relation, SelfKey extends keyof Relation> = {
  [K in keyof Relation]: Relation[K];
}[];

/**
 * Creates a Many-to-One relationship with another entity.
 *
 * @example
 * ```ts
 * interface Post extends IOrchaModel<string> {
 *   user: IManyToOne<'posts', User>;
 * }
 *
 * interface User extends IOrchaModel<string> {
 *   posts: IOneToMany<'user', Post>;
 * }
 * ```
 */
export type IManyToOne<Relation, SelfKey extends keyof Relation> = {
  [K in keyof Relation]: Relation[K];
};

/**
 * Utility type for any relation.
 */
export type IAnyRelation<Relation, SelfKey extends keyof Relation> =
  | IOneToOne<Relation, SelfKey>
  | IOneToMany<Relation, SelfKey>
  | IManyToOne<Relation, SelfKey>;

/**
 * Filter an entity to only have its fields (no relations).
 */
export type IProps<T> = {
  [K in keyof T as NonNullable<T[K]> extends object
    ? NonNullable<T[K]> extends IAnyRelation<infer R, infer RK>
      ? Required<T> extends Required<Omit<R, RK>>
        ? K
        : never
      : K
    : K]: T[K];
};

/**
 * Filter an entity to only have relations (no fields).
 */
export type IRelations<T> = {
  [K in keyof T as NonNullable<T[K]> extends object
    ? NonNullable<T[K]> extends IAnyRelation<infer R, infer RK>
      ? Required<T> extends Required<Omit<R, RK>>
        ? never
        : K
      : never
    : never]: T[K];
};

/**
 * Utility type when creating an entity to a repository function.
 */
export type ICreateEntity<T> = Omit<
  {
    [K in keyof IProps<T> as null extends T[K] ? K : undefined extends T[K] ? K : never]?: T[K] | null;
  } & {
    [K in keyof IProps<T> as null extends T[K] ? never : undefined extends T[K] ? never : K]: T[K];
  } & {
    [K in keyof IRelations<T> as null extends T[K]
      ? K
      : undefined extends T[K]
      ? K
      : never]?: CreateEntityRelations<T[K], T> | null;
  } & {
    [K in keyof IRelations<T> as null extends T[K]
      ? never
      : undefined extends T[K]
      ? never
      : K]: CreateEntityRelations<T[K], T>;
  },
  typeof ORCHA_VIEW
> &
  (T extends IOrchaModel<infer ID> ? { [ORCHA_ID]: ID } : { [ORCHA_ID]: string | number });

type CreateEntityRelations<T, R> = T extends Array<infer A>
  ? A extends IOrchaModel<infer Id>
    ? (Id | ICreateEntity<OmitParentRelations<A, R>>)[]
    : never
  : T extends IOrchaModel<infer Id>
  ? Id | ICreateEntity<OmitParentRelations<T, R>>
  : never;

type OmitParentRelations<T, R> = {
  [K in keyof T as T[K] extends IAnyRelation<R, infer _> ? never : K]: T[K];
};

/**
 * Utility type when updating an entity to a repository function.
 */
export type IUpdateEntity<T> = Omit<Partial<ICreateEntity<T>>, typeof ORCHA_ID>;
