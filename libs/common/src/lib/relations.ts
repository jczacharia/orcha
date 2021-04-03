/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

export type IOneToOne<Relation> = Relation;

export type IOneToMany<Relation> = Relation[];

export type IManyToOne<Relation> = Relation;

/**
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
 *   todos: IManyToMany<Tag>;
 * }
 *
 * interface Tag {
 *   id: string;
 *   tags: IManyToMany<Todo>;
 * }
 * ```
 * Do this:
 * ```ts
 * interface Todo {
 *   id: string;
 *   todoTags: IOneToMany<TodoTag>;
 * }
 *
 * interface Tag {
 *   id: string;
 *   todoTags: IOneToMany<TodoTag>;
 * }
 *
 * interface TodoTag {
 *   id: string;
 *   dateLinked: Date | string; // Added meta column.
 *   todo: IManyToOne<Todo>;
 *   tag: IManyToOne<Tag>;
 * }
 * ```
 */
export type IManyToMany<Relation> = Relation[];

export type IArrayRelations<Relation = any> = IOneToMany<Relation> | IManyToMany<Relation>;

export type ISingularRelations<Relation = any> = IOneToOne<Relation> | IManyToOne<Relation>;

export type IAnyRelation<Relation = any> =
  | IOneToOne<Relation>
  | IOneToMany<Relation>
  | IManyToOne<Relation>
  | IManyToMany<Relation>;

export type IProps<T> = {
  [K in keyof T as NonNullable<T[K]> extends IAnyRelation<T[K]> ? K : never]: T[K];
};

export type IRelations<T> = {
  [K in keyof T as NonNullable<T[K]> extends IAnyRelation<T[K]> ? never : K]: T[K];
};

export type IInsertEntity<T> = {
  [K in keyof T]: NonNullable<T[K]> extends IAnyRelation<T[K]>
    ? T[K] extends Array<infer A>
      ? (IInsertEntity<A> | string)[]
      : IInsertEntity<T[K]> | string | null | { id: string }
    : T[K];
};

export type IUpdateEntity<T> = Partial<IInsertEntity<T>>;
