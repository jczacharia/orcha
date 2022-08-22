import { IPaginate, IPagination } from './pagination';
import { IParser } from './parser';
import { IExactQuery, IQuery } from './query';
import { ICreateEntity, IOrchaModel, IUpdateEntity } from './relations';

export abstract class OrchaBaseRepositoryPort<
  T extends IOrchaModel<IdType>,
  IdType extends string | number = T extends IOrchaModel<infer ID> ? ID : never
> {
  abstract findOne<Q extends IQuery<T>>(id: IdType, query: IExactQuery<T, Q>): Promise<IParser<T, Q> | null>;
  abstract findOneOrFail<Q extends IQuery<T>>(id: IdType, query: IExactQuery<T, Q>): Promise<IParser<T, Q>>;
  abstract findMany<Q extends IQuery<T>>(ids: IdType[], query: IExactQuery<T, Q>): Promise<IParser<T[], Q>>;
  abstract findAll<Q extends IQuery<T>>(query: IExactQuery<T, Q>): Promise<IParser<T[], Q>>;

  abstract countAll(): Promise<number>;

  abstract createOne<Q extends IQuery<T>>(
    model: ICreateEntity<T>,
    query: IExactQuery<T, Q>
  ): Promise<IParser<T, Q>>;
  abstract createMany<Q extends IQuery<T>>(
    models: ICreateEntity<T>[],
    query: IExactQuery<T, Q>
  ): Promise<IParser<T[], Q>>;

  abstract updateOne<Q extends IQuery<T>>(
    id: IdType,
    changes: IUpdateEntity<T>,
    query: IExactQuery<T, Q>
  ): Promise<IParser<T, Q>>;
  abstract updateMany<Q extends IQuery<T>>(
    models: { id: IdType; changes: IUpdateEntity<T> }[],
    query: IExactQuery<T, Q>
  ): Promise<IParser<T[], Q>>;

  abstract deleteOne(id: IdType): Promise<IdType>;
  abstract deleteMany(ids: IdType[]): Promise<IdType[]>;

  abstract paginateAll<Q extends IQuery<T>>(
    paginate: IPaginate,
    query: IExactQuery<T, Q>
  ): Promise<IPagination<IParser<T, Q>>>;
}
