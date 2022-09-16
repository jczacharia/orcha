import {
  EntityRepository,
  FilterQuery,
  FindOneOptions,
  FindOneOrFailOptions,
  FindOptions,
  MikroORM,
  wrap,
} from '@mikro-orm/core';
import {
  ICreateEntity,
  IExactQuery,
  IOrchaModel,
  IPaginateQuery,
  IPagination,
  IParser,
  IQuery,
  IUpdateEntity,
  OrchaBaseRepositoryPort,
  parseQuery,
} from '@orcha/common';
import { IOrchaMikroOrmEntity } from './mikro-orm-orcha-entity';
import { createMikroOrmPopulateArray } from './populate-transform';
/**
 * Inherits all repository functionalities required to perform CRUD operations on an entity.
 */
export abstract class IOrchaMikroOrmRepository<
  T extends IOrchaModel<IdType>,
  E extends IOrchaMikroOrmEntity<T>,
  IdType extends string | number = T extends IOrchaModel<infer ID> ? ID : never
> implements OrchaBaseRepositoryPort<T, IdType>
{
  constructor(public repo: EntityRepository<E>, public orm: MikroORM) {}

  async findOne<Q extends IQuery<T>>(id: IdType, query: IExactQuery<T, Q>): Promise<IParser<T, Q> | null> {
    const populate = createMikroOrmPopulateArray(query);
    const entity = await this.repo.findOne({ id } as FilterQuery<E>, { populate });
    const json = entity ? wrap(entity).toJSON() : null;
    return parseQuery<any, any>(json, query) as Promise<IParser<T, Q> | null>;
  }

  async findOneOrFail<Q extends IQuery<T>>(id: IdType, query: IExactQuery<T, Q>): Promise<IParser<T, Q>> {
    const populate = createMikroOrmPopulateArray(query);
    const entity = await this.repo.findOneOrFail({ id } as FilterQuery<E>, { populate });
    const json = wrap(entity).toJSON();
    return parseQuery<any, any>(json, query) as Promise<IParser<T, Q>>;
  }

  async findMany<Q extends IQuery<T>>(ids: IdType[], query: IExactQuery<T, Q>): Promise<IParser<T[], Q>> {
    const populate = createMikroOrmPopulateArray(query);
    const entities = await this.repo.find({ id: { $in: ids } } as FilterQuery<E>, { populate });
    const json = entities.map((e) => wrap(e).toJSON());
    return parseQuery<any, any>(json, query) as Promise<IParser<T[], Q>>;
  }

  async findAll<Q extends IQuery<T>>(query: IExactQuery<T, Q>): Promise<IParser<T[], Q>> {
    const populate = createMikroOrmPopulateArray(query);
    const entities = await this.repo.findAll({ populate });
    const json = entities.map((e) => wrap(e).toJSON());
    return parseQuery<any, any>(json, query) as Promise<IParser<T[], Q>>;
  }

  async countAll(): Promise<number> {
    return this.repo.count();
  }

  async createOne<Q extends IQuery<T>>(
    model: ICreateEntity<T>,
    query: IExactQuery<T, Q>
  ): Promise<IParser<T, Q>> {
    const entity = this.repo.create(model as any) as any;
    await this.repo.persistAndFlush(entity);
    return this.findOneOrFail(entity.id, query);
  }

  async createMany<Q extends IQuery<T>>(
    models: ICreateEntity<T>[],
    query: IExactQuery<T, Q>
  ): Promise<IParser<T[], Q>> {
    const entities = models.map((m) => this.repo.create(m as any));
    await this.repo.persistAndFlush(entities);
    const ids = models.map((m) => m.id as IdType);
    return this.findMany(ids, query);
  }

  async updateOne<Q extends IQuery<T>>(
    id: IdType,
    changes: IUpdateEntity<T>,
    query: IExactQuery<T, Q>
  ): Promise<IParser<T, Q>> {
    const populate = createMikroOrmPopulateArray(query);
    const entity = await this.repo.findOneOrFail({ id } as FilterQuery<E>, { populate });
    this.deleteAllUndefined(changes);
    wrap(entity).assign(changes as any);
    await this.repo.persistAndFlush(entity);
    return this.findOneOrFail(id, query);
  }

  async updateMany<Q extends IQuery<T>>(
    models: { id: IdType; changes: IUpdateEntity<T> }[],
    query: IExactQuery<T, Q>
  ): Promise<IParser<T[], Q>> {
    const populate = createMikroOrmPopulateArray(query);
    const entities = await this.repo.find({ id: { $in: models.map((m) => m.id) } } as FilterQuery<E>, {
      populate,
    });
    for (const e of entities) {
      const entity = models.find((m) => m.id === (e as any).id);
      if (entity) {
        this.deleteAllUndefined(entity.changes);
        wrap(e).assign(entity.changes as any);
      }
    }
    await this.repo.persistAndFlush(entities);
    return this.findMany(
      entities.map((e: any) => e.id),
      query
    );
  }

  async deleteOne<Q extends IQuery<T>>(id: IdType, query?: IExactQuery<T, Q>): Promise<IdType> {
    const populate = query ? createMikroOrmPopulateArray(query) : [];
    const entity = await this.repo.findOneOrFail({ id } as FilterQuery<E>, { populate });
    await this.repo.removeAndFlush(entity);
    return id;
  }

  async deleteMany<Q extends IQuery<T>>(ids: IdType[], query?: IExactQuery<T, Q>): Promise<IdType[]> {
    const populate = query ? createMikroOrmPopulateArray(query) : [];
    const entities = await this.repo.find({ id: { $in: ids } } as FilterQuery<E>, { populate });
    await this.repo.removeAndFlush(entities);
    return ids;
  }

  async paginateAll<Q extends IQuery<T>>(
    paginate: IPaginateQuery,
    query: IExactQuery<T, Q>
  ): Promise<IPagination<IParser<T, Q>>> {
    const populate = createMikroOrmPopulateArray(query as IExactQuery<T, Q>);
    const [entities, count] = await this.repo.findAndCount({} as FilterQuery<E>, {
      populate,
      limit: paginate.limit,
      offset: paginate.offset,
    });
    const json = entities.map((e) => wrap(e).toJSON());
    return { items: (await parseQuery<any, any>(json, query)) as any, count };
  }

  private deleteAllUndefined(obj: any) {
    Object.keys(obj).forEach((key) => (obj[key] === undefined ? delete obj[key] : {}));
  }

  /** Helpers for advance querying. */
  readonly orchaMikro = {
    findOneOrFail: async <Q extends IQuery<T>>(
      filter: FilterQuery<E>,
      query: IExactQuery<T, Q>,
      options?: Omit<FindOneOrFailOptions<E, any>, 'populate'>
    ): Promise<IParser<T, Q>> => {
      const populate = createMikroOrmPopulateArray(query);
      const dbRes = await this.repo.findOneOrFail(filter, { ...options, populate });
      const json = wrap(dbRes).toJSON();
      return parseQuery<any, any>(json, query) as Promise<IParser<T, Q>>;
    },

    findOne: async <Q extends IQuery<T>>(
      filter: FilterQuery<E>,
      query: IExactQuery<T, Q>,
      options?: Omit<FindOneOptions<E, any>, 'populate'>
    ): Promise<IParser<T, Q> | null> => {
      const populate = createMikroOrmPopulateArray(query);
      const dbRes = await this.repo.findOne(filter, { ...options, populate });
      const json = dbRes ? wrap(dbRes).toJSON() : null;
      return parseQuery<any, any>(json, query) as Promise<IParser<T, Q> | null>;
    },

    find: async <Q extends IQuery<T>>(
      filter: FilterQuery<E>,
      query: IExactQuery<T, Q>,
      options?: Omit<FindOptions<E, any>, 'populate'>
    ): Promise<IParser<T[], Q>> => {
      const populate = createMikroOrmPopulateArray(query) as any;
      const entities = await this.repo.find(filter, { ...options, populate });
      const json = entities.map((e) => wrap(e).toJSON());
      return parseQuery<any, any>(json, query) as Promise<IParser<T[], Q>>;
    },

    findAndCount: async <Q extends IQuery<T>>(
      filter: FilterQuery<E>,
      query: IExactQuery<T, Q>,
      options?: Omit<FindOptions<E, any>, 'populate'>
    ): Promise<[IParser<T[], Q>, number]> => {
      const populate = createMikroOrmPopulateArray(query) as any;
      const [entities, count] = await this.repo.findAndCount(filter, { ...options, populate });
      const json = entities.map((e) => wrap(e).toJSON());
      return [(await parseQuery<any, any>(json, query)) as IParser<T[], Q>, count];
    },

    paginate: async <Q extends IQuery<T>>(
      filter: FilterQuery<E>,
      query: IExactQuery<T, Q>,
      options?: Omit<FindOptions<E, any>, 'populate'>
    ): Promise<IPagination<IParser<T, Q>>> => {
      const populate = createMikroOrmPopulateArray(query as IExactQuery<T, Q>);
      const [entities, count] = await this.repo.findAndCount(filter, { ...options, populate });
      const json = entities.map((e) => wrap(e).toJSON());
      return { items: (await parseQuery<any, any>(json, query)) as any, count };
    },
  };
}
