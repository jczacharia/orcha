/* eslint-disable @typescript-eslint/no-explicit-any */
export type IOneToOne<Self, Relation> = {
  [K in keyof Relation as Relation[K] extends IOneToOne<Relation, infer S>
    ? S extends Self
      ? never
      : K
    : K]: Relation[K];
};

export type IOneToMany<Self, Relation> = {
  [K in keyof Relation as Relation[K] extends IManyToOne<Relation, infer S>
    ? S extends Self
      ? never
      : K
    : K]: Relation[K];
}[];

export type IManyToOne<Self, Relation> = {
  [K in keyof Relation as Relation[K] extends IOneToMany<Relation, infer S>
    ? S extends Self
      ? never
      : K
    : K]: Relation[K];
};

export type IManyToMany<Self, Relation> = {
  [K in keyof Relation as Relation[K] extends IManyToMany<Relation, infer S>
    ? S extends Self
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
  [K in keyof T as T[K] extends IAnyRelation ? never : K]: T[K];
};

export type IRelations<T> = {
  [K in keyof T as T[K] extends IAnyRelation ? K : never]: T[K];
};
