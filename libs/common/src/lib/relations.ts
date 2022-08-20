/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { ORCHA_ID } from './constants';

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
  [K in keyof Relation as SelfKey extends K ? never : K]: Relation[K];
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
  [K in keyof Relation as SelfKey extends K ? never : K]: Relation[K];
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
  [K in keyof Relation as SelfKey extends K ? never : K]: Relation[K];
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
export type IProps<T extends IOrchaModel<any>> = {
  [K in keyof T as NonNullable<T[K]> extends object
    ? {
        [_ in keyof NonNullable<T[K]>]: NonNullable<T[K]> extends IAnyRelation<infer R, infer _>
          ? Required<T> extends Required<R>
            ? K
            : never
          : K;
      }[keyof NonNullable<T[K]>]
    : K]: T[K];
};

/**
 * Filter an entity to only have relations (no fields).
 */
export type IRelations<T extends IOrchaModel<any>> = {
  [K in keyof T as NonNullable<T[K]> extends object
    ? {
        [_ in keyof NonNullable<T[K]>]: NonNullable<T[K]> extends IAnyRelation<infer R, infer _>
          ? Required<T> extends Required<R>
            ? never
            : K
          : never;
      }[keyof NonNullable<T[K]>]
    : never]: T[K];
};

/**
 * Utility type when creating an entity to a repository function.
 */
export type ICreateEntity<T extends IOrchaModel<any>> = {
  [K in keyof T]: K extends typeof ORCHA_ID
    ? T[typeof ORCHA_ID]
    : NonNullable<T[K]> extends object
    ? {
        [_ in keyof NonNullable<T[K]>]: NonNullable<T[K]> extends IAnyRelation<infer R, infer _>
          ? Required<T> extends Required<R>
            ? T[K]
            : T[K] extends Array<infer A>
            ? A extends IOrchaModel<infer IdType>
              ? (ICreateEntity<A> | IdType)[]
              : never
            : NonNullable<T[K]> extends IOrchaModel<infer IdType>
            ? T[K] extends IOrchaModel<any>
              ? ICreateEntity<T[K]> | IdType | { id: IdType }
              : never
            : never
          : T[K];
      }[keyof NonNullable<T[K]>]
    : T[K];
};

/**
 * Utility type when updating an entity to a repository function.
 */
export type IUpdateEntity<T extends IOrchaModel<any>> = Omit<Partial<ICreateEntity<T>>, typeof ORCHA_ID>;
