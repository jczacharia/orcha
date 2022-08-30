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

  abstract paginateAll<Q extends IQuery<T>>(
    paginate: IPaginate,
    query: IExactQuery<T, Q>
  ): Promise<IPagination<IParser<T, Q>>>;

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
}

export abstract class OrchaDbTransactionalPort {
  abstract runInTransaction(fn: (t: OrchaDbTransactionalPort) => Promise<void>): Promise<void>;

  abstract create<
    T extends IOrchaModel<IdType>,
    IdType extends string | number = T extends IOrchaModel<infer ID> ? ID : never
  >(repo: OrchaBaseRepositoryPort<T, IdType>, model: ICreateEntity<T>): Promise<void>;

  abstract createMany<
    T extends IOrchaModel<IdType>,
    IdType extends string | number = T extends IOrchaModel<infer ID> ? ID : never
  >(repo: OrchaBaseRepositoryPort<T, IdType>, models: ICreateEntity<T>[]): Promise<void>;

  abstract update<
    T extends IOrchaModel<IdType>,
    IdType extends string | number = T extends IOrchaModel<infer ID> ? ID : never
  >(repo: OrchaBaseRepositoryPort<T, IdType>, id: IdType, model: ICreateEntity<T>): Promise<void>;

  abstract updateMany<
    T extends IOrchaModel<IdType>,
    IdType extends string | number = T extends IOrchaModel<infer ID> ? ID : never
  >(
    repo: OrchaBaseRepositoryPort<T, IdType>,
    models: { id: IdType; changes: ICreateEntity<T> }[]
  ): Promise<void>;

  abstract delete<
    T extends IOrchaModel<IdType>,
    IdType extends string | number = T extends IOrchaModel<infer ID> ? ID : never
  >(repo: OrchaBaseRepositoryPort<T, IdType>, id: IdType): Promise<void>;

  abstract deleteMany<
    T extends IOrchaModel<IdType>,
    IdType extends string | number = T extends IOrchaModel<infer ID> ? ID : never
  >(repo: OrchaBaseRepositoryPort<T, IdType>, ids: IdType[]): Promise<void>;
}
