import { EntityRepository, FilterQuery, FindOptions, MikroORM, wrap } from '@mikro-orm/core';
import {
  ICreateEntity,
  IExactQuery,
  IOrchaModel,
  IPaginate,
  IPagination,
  IParser,
  IParseUndefined,
  IQuery,
  IUpdateEntity,
  OrchaBaseRepositoryPort,
  parseQuery,
} from '@orcha/common';
import { createMikroOrmPopulateArray } from './populate';

/**
 * Inherits all repository functionalities required to perform CRUD operations on an entity.
 */
export abstract class IOrchaMikroOrmRepository<
  T extends IOrchaModel<IdType>,
  E,
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
    const ids = models.map((m) => m.id);
    return this.findMany(ids, query);
  }

  async updateOne<Q extends IQuery<T>>(
    id: IdType,
    changes: IUpdateEntity<T>,
    query: IExactQuery<T, Q>
  ): Promise<IParser<T, Q>> {
    const entity = await this.repo.findOneOrFail({ id } as FilterQuery<E>);
    this.deleteAllUndefined(changes);
    wrap(entity).assign(changes as any);
    await this.repo.persistAndFlush(entity);
    return this.findOneOrFail(id, query);
  }

  async updateMany<Q extends IQuery<T>>(
    models: { id: IdType; changes: IUpdateEntity<T> }[],
    query: IExactQuery<T, Q>
  ): Promise<IParseUndefined<T, Q>[]> {
    const entities = await this.repo.find({ id: { $in: models.map((m) => m.id) } } as FilterQuery<E>);
    for (const e of entities) {
      const changes = models.find((m) => m.id === (e as any).id);
      if (changes) {
        this.deleteAllUndefined(changes);
        wrap(e).assign(changes as any);
      }
    }
    await this.repo.persistAndFlush(entities);
    return this.findMany(
      entities.map((e: any) => e.id),
      query
    );
  }

  async deleteOne(id: IdType): Promise<IdType> {
    const entity = await this.repo.findOneOrFail({ id } as FilterQuery<E>);
    await this.repo.removeAndFlush(entity);
    return id;
  }

  async deleteMany(ids: IdType[]): Promise<IdType[]> {
    const entities = await this.repo.find({ id: { $in: ids } } as FilterQuery<E>);
    await this.repo.removeAndFlush(entities);
    return ids;
  }

  async paginateAll<Q extends IQuery<T>>(
    paginate: IPaginate,
    query: IExactQuery<T, Q>
  ): Promise<IPagination<IParser<T, Q>>> {
    const populate = createMikroOrmPopulateArray(query as IExactQuery<T, Q>);
    const [entities, count] = await this.repo.findAndCount({} as FilterQuery<E>, {
      populate,
      limit: paginate.limit,
      offset: paginate.offset,
    });
    const json = entities.map((e) => wrap(e).toJSON());
    return { items: parseQuery<any, any>(json, query) as any, count };
  }

  private deleteAllUndefined(obj: any) {
    Object.keys(obj).forEach((key) => (obj[key] === undefined ? delete obj[key] : {}));
  }

  /** Helpers for advance querying. */
  readonly orchaMikro = {
    find: async <Q extends IQuery<T>>(
      orchaQuery: IExactQuery<T, Q>,
      query: FilterQuery<E>,
      options?: Omit<FindOptions<E>, 'populate'>
    ): Promise<IParser<T[], Q>> => {
      const populate = createMikroOrmPopulateArray(orchaQuery) as any;
      const entities = await this.repo.find(query, { populate, ...options });
      const json = entities.map((e) => wrap(e).toJSON());
      return parseQuery<any, any>(orchaQuery, json) as Promise<IParser<T[], Q>>;
    },

    paginate: async <Q extends IQuery<T>>(
      paginate: IPaginate,
      orchaQuery: IExactQuery<T, Q> & IPaginate,
      options?: FilterQuery<E>
    ): Promise<IPagination<IParser<T, Q>>> => {
      const populate = createMikroOrmPopulateArray(orchaQuery as IExactQuery<T, Q>);
      const [entities, count] = await this.repo.findAndCount(options || ({} as FilterQuery<E>), {
        populate,
        limit: paginate.limit,
        offset: paginate.offset,
      });
      const json = entities.map((e) => wrap(e).toJSON());
      return { items: parseQuery<any, any>(json, orchaQuery) as any, count };
    },
  };
}
