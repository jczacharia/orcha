export type RecursivelyConvertDatesToStrings<T> = T extends Date
  ? string
  : T extends Array<infer U>
  ? RecursivelyConvertDatesToStrings<U>[]
  : T extends object
  ? { [K in keyof T]: RecursivelyConvertDatesToStrings<T[K]> }
  : T;

export type NullToOptional<T> = T extends Array<infer M>
  ? NullToOptional<M>[]
  : {
      [K in keyof T as null extends T[K] ? K : never]?: NonNullable<T[K]> extends Array<infer A>
        ? NullToOptional<A>[]
        : NonNullable<T[K]> extends object
        ? NullToOptional<T[K]>
        : T[K];
    } & {
      [K in keyof T as null extends T[K] ? never : K]: NonNullable<T[K]> extends Array<infer A>
        ? NullToOptional<A>[]
        : NonNullable<T[K]> extends object
        ? NullToOptional<T[K]>
        : T[K];
    };
