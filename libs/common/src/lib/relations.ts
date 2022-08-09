/* eslint-disable @typescript-eslint/no-unused-vars */

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
export type IOrchaModel<IdType extends string | number> = { id: IdType };

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
export type IProps<T> = {
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
export type IRelations<T> = {
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
 * Utility type when upserting an entity to a database function.
 */
export type IUpsertEntity<T> = {
  [K in keyof T]: NonNullable<T[K]> extends object
    ? {
        [_ in keyof NonNullable<T[K]>]: NonNullable<T[K]> extends IAnyRelation<infer R, infer _>
          ? Required<T> extends Required<R>
            ? T[K]
            : T[K] extends Array<infer A>
            ? A extends IOrchaModel<infer IdType>
              ? (IUpsertEntity<A> | IdType)[]
              : never
            : NonNullable<T[K]> extends IOrchaModel<infer IdType>
            ? IUpsertEntity<T[K]> | IdType | { id: IdType }
            : never
          : T[K];
      }[keyof NonNullable<T[K]>]
    : T[K];
};

/**
 * Utility type when updating an entity to a database function.
 */
export type IUpdateEntity<T> = Omit<Partial<IUpsertEntity<T>>, 'id'>;
