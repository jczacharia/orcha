import { Collection } from '@mikro-orm/core';
import { IOneToMany, IOrchaModel, IProps, IRelations, ORCHA_VIEW } from '@orcha/common';
export type IOrchaMikroOrmEntity<T extends IOrchaModel<string | number>> = {
  [K in keyof IProps<T> as K extends typeof ORCHA_VIEW ? K : never]: () => Promise<T[K]> | T[K];
} & {
  [K in keyof Omit<IProps<T>, typeof ORCHA_VIEW>]: T[K];
} & {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  [K in keyof IRelations<T>]: T[K] extends IOneToMany<infer _, infer __> ? Collection<any> : any;
};
