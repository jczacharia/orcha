/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Creates a One-to-One relationship with another entity.
 *
 * @example
 * ```ts
 * interface User {
 *   id: string;
 *   privateData: IOneToOne<User, UserPrivate>;
 * }
 *
 * interface UserPrivate {
 *   id: string;
 *   user: IOneToOne<UserPrivate, User>;
 * }
 * ```
 */
export type IOneToOne<Self, Relation> = {
  [K in keyof Relation as Relation[K] extends IOneToOne<Relation, infer S>
    ? Required<S> extends Required<Self>
      ? never
      : K
    : K]: Relation[K];
};

/**
 * Creates a One-to-Many relationship with another entity.
 *
 * @example
 * ```ts
 * interface User {
 *   id: string;
 *   posts: IOneToMany<User, Post>;
 * }
 *
 * interface Post {
 *   id: string;
 *   user: IManyToOne<Post, User>;
 * }
 * ```
 */
export type IOneToMany<Self, Relation> = {
  [K in keyof Relation as Relation[K] extends IManyToOne<Relation, infer S>
    ? Required<S> extends Required<Self>
      ? never
      : K
    : K]: Relation[K];
}[];

/**
 * Creates a Many-to-One relationship with another entity.
 *
 * @example
 * ```ts
 * interface Post {
 *   id: string;
 *   user: IManyToOne<Post, User>;
 * }
 *
 * interface User {
 *   id: string;
 *   posts: IOneToMany<User, Post>;
 * }
 * ```
 */
export type IManyToOne<Self, Relation> = {
  [K in keyof Relation as Relation[K] extends IOneToMany<Relation, infer S>
    ? Required<S> extends Required<Self>
      ? never
      : K
    : K]: Relation[K];
};

/**
 * Creates a Many-to-Many relationship with another entity.
 *
 * @example
 * ```ts
 * interface Todo {
 *   id: string;
 *   todos: IManyToMany<Todo, Tag>;
 * }
 *
 * interface Tag {
 *   id: string;
 *   tags: IManyToMany<Tag, Todo>;
 * }
 * ```
 *
 * @note
 * It is not recommended to directly use Many-to-Many relationships but instead, create a separate
 * entity that links the two entities together by using One-to-Many and Many-to-One relations.
 * This has the added advantage of adding columns to your linked entities.
 *
 *
 * Instead of doing this:
 * ```ts
 * interface Todo {
 *   id: string;
 *   todos: IManyToMany<Todo, Tag>;
 * }
 *
 * interface Tag {
 *   id: string;
 *   tags: IManyToMany<Tag, Todo>;
 * }
 * ```
 * Do this:
 * ```ts
 * interface Todo {
 *   id: string;
 *   taggedTodos: IOneToMany<Todo, TaggedTodo>;
 * }
 *
 * interface Tag {
 *   id: string;
 *   taggedTodos: IOneToMany<Tag, TaggedTodo>;
 * }
 *
 * interface TaggedTodo {
 *   id: string;
 *   dateLinked: Date | string; // Added meta column.
 *   todo: IManyToOne<TaggedTodo, Todo>;
 *   tag: IManyToOne<TaggedTodo, Tag>;
 * }
 * ```
 */
export type IManyToMany<Self, Relation> = {
  [K in keyof Relation as Relation[K] extends IManyToMany<Relation, infer S>
    ? Required<S> extends Required<Self>
      ? never
      : K
    : K]: Relation[K];
}[];

/**
 * Utility type for any relation.
 */
export type IAnyRelation<Self = any, Relation = any> =
  | IOneToOne<Self, Relation>
  | IOneToMany<Self, Relation>
  | IManyToOne<Self, Relation>
  | IManyToMany<Self, Relation>;

/**
 * Filter an entity to only have its fields (no relations).
 */
export type IProps<T> = {
  [K in keyof T as NonNullable<T[K]> extends IAnyRelation<T[K], Required<infer _>> ? K : never]: T[K];
};

/**
 * Filter an entity to only have relations (no fields).
 */
export type IRelations<T> = {
  [K in keyof T as NonNullable<T[K]> extends IAnyRelation<T[K], Required<infer _>> ? never : K]: T[K];
};

/**
 * Utility type when upserting an entity to a database function.
 */
export type IUpsertEntity<T> = {
  [K in keyof T]: NonNullable<T[K]> extends IAnyRelation<T[K], Required<infer _>>
    ? T[K]
    : T[K] extends Array<infer A>
    ? (IUpsertEntity<A> | string)[]
    : IUpsertEntity<T[K]> | string | null | { id: string };
};

/**
 * Utility type when updating an entity to a database function.
 */
export type IUpdateEntity<T> = Partial<IUpsertEntity<T>>;
