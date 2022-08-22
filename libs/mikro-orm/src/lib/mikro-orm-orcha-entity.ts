import { IAnyRelation, IOrchaModel, IProps } from '@orcha/common';

type IRelationsToAny<T extends IOrchaModel<any>> = {
  [K in keyof T as NonNullable<T[K]> extends object
    ? {
        [_ in keyof NonNullable<T[K]>]: NonNullable<T[K]> extends IAnyRelation<infer R, infer _>
          ? Required<T> extends Required<R>
            ? never
            : K
          : never;
      }[keyof NonNullable<T[K]>]
    : never]: any;
};

export type IOrchaMikroOrmEntity<T extends IOrchaModel<any>> = IProps<T> & IRelationsToAny<T>;
