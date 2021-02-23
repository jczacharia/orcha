/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type IOneToOne<Self, Relation> = {
  [K in keyof Relation as Relation[K] extends IOneToOne<Relation, infer S>
    ? Required<S> extends Required<Self>
      ? never
      : K
    : K]: Relation[K];
};

export type IOneToMany<Self, Relation> = {
  [K in keyof Relation as Relation[K] extends IManyToOne<Relation, infer S>
    ? Required<S> extends Required<Self>
      ? never
      : K
    : K]: Relation[K];
}[];

export type IManyToOne<Self, Relation> = {
  [K in keyof Relation as Relation[K] extends IOneToMany<Relation, infer S>
    ? Required<S> extends Required<Self>
      ? never
      : K
    : K]: Relation[K];
};

export type IManyToMany<Self, Relation> = {
  [K in keyof Relation as Relation[K] extends IManyToMany<Relation, infer S>
    ? Required<S> extends Required<Self>
      ? never
      : K
    : K]: Relation[K];
}[];

export type IArrayRelations<Self = any, Relation = any> =
  | IOneToMany<Self, Relation>
  | IManyToMany<Self, Relation>;

export type ISingularRelations<Self = any, Relation = any> =
  | IOneToOne<Self, Relation>
  | IManyToOne<Self, Relation>;

export type IAnyRelation<Self = any, Relation = any> =
  | IOneToOne<Self, Relation>
  | IOneToMany<Self, Relation>
  | IManyToOne<Self, Relation>
  | IManyToMany<Self, Relation>;

export type IProps<T> = {
  [K in keyof T as NonNullable<T[K]> extends IAnyRelation<T[K], Required<infer _>> ? K : never]: T[K];
};

export type IRelations<T> = {
  [K in keyof T as NonNullable<T[K]> extends IAnyRelation<T[K], Required<infer _>> ? never : K]: T[K];
};

export type IInsertEntity<T> = {
  [K in keyof T]: NonNullable<T[K]> extends IAnyRelation<T[K], Required<infer _>>
    ? T[K]
    : T[K] extends Array<infer A>
    ? (IInsertEntity<A> | string)[]
    : IInsertEntity<T[K]> | string | null | { id: string };
};

export type IUpdateEntity<T> = Partial<IInsertEntity<T>>;
