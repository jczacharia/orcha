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

export type IAnyRelation<Self, Relation> =
  | IOneToOne<Self, Relation>
  | IOneToMany<Self, Relation>
  | IManyToOne<Self, Relation>
  | IManyToMany<Self, Relation>;
