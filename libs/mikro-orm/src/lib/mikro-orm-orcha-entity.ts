import { Collection } from '@mikro-orm/core';
import { IOneToMany, IOrchaModel, IProps, IRelations } from '@orcha/common';
export type IOrchaMikroOrmEntity<T extends IOrchaModel<string | number>> = {
  [K in keyof IProps<T>]: T[K];
} & {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  [K in keyof IRelations<T>]: T[K] extends IOneToMany<infer _, infer __> ? Collection<any> : any;
};
