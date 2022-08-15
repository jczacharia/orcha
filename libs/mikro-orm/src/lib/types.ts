import { Collection } from '@mikro-orm/core';
import { IAnyRelation, IManyToOne, IOneToMany, IOneToOne, IOrchaView } from '@orcha/common';

export type IOrchaMikroOrmEntity<T> = {
  [K in keyof T]: NonNullable<T[K]> extends IOrchaView<infer R>
    ? IOrchaView<R>
    : NonNullable<T[K]> extends object
    ?
        | {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [_ in keyof NonNullable<T[K]>]-?: NonNullable<T[K]> extends IAnyRelation<infer R, infer __>
              ? Required<T> extends Required<R>
                ? T[K]
                : NonNullable<T[K]> extends IOneToMany<infer OM, infer ___>
                ? Required<T> extends Required<OM>
                  ? T[K]
                  : Collection<IOrchaMikroOrmEntity<OM>>
                : NonNullable<T[K]> extends IOneToOne<infer OO, infer ____>
                ? Required<T> extends Required<OO>
                  ? NonNullable<T[K]> extends IManyToOne<infer MO, infer _____>
                    ? Required<T> extends Required<MO>
                      ? T[K]
                      : IOrchaMikroOrmEntity<MO>
                    : T[K]
                  : IOrchaMikroOrmEntity<OO>
                : T[K]
              : T[K];
          }[keyof NonNullable<T[K]>]
        | (null extends T[K] ? null : never)
        | (undefined extends T[K] ? undefined : never)
    : T[K];
};
