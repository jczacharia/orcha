import { IExactQuery, IOrchaModel, IParser, IProps, IQuery } from '@orcha/common';

export abstract class IBaseRepository<
  T extends IOrchaModel<IdType>,
  IdType extends string | number = T extends IOrchaModel<infer ID> ? ID : never
> {
  abstract findOne(id: IdType): Promise<IProps<T> | null>;
  abstract findOneOrFail(id: IdType): Promise<IProps<T>>;
  abstract updateProps(id: IdType, model: Partial<IProps<T>>): Promise<IProps<T>>;

  abstract orchaFindOne<Q extends IQuery<T>>(
    id: IdType,
    query: IExactQuery<T, Q>
  ): Promise<IParser<T, IExactQuery<T, Q>> | null>;
  abstract orchaFindOneOrFail<Q extends IQuery<T>>(
    id: IdType,
    query: IExactQuery<T, Q>
  ): Promise<IParser<T, IExactQuery<T, Q>>>;
}
