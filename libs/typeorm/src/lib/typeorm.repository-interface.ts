import {
  IExactQuery,
  IPaginate,
  IParser,
  IProps,
  IQuery,
  IUpdateEntity,
  IUpsertEntity,
  ORCHA_LIMIT,
  ORCHA_PAGE,
  ORCHA_PAGINATE,
  parseQuery,
} from '@orcha/common';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Socket } from 'socket.io';
import { DeepPartial, FindManyOptions, Repository } from 'typeorm';
import { createTypeormRelationsArray } from './relations.transform';
import { GatewaysStorage } from './subscription-storage';

/**
 * Inherits all repository functionalities required to perform CRUD operations on an entity.
 */
export abstract class IOrchaTypeormRepository<
  Entity extends { id: IdType },
  IdType extends string | number = string
> {
  private readonly _gatewaysStorage = new GatewaysStorage<Entity, IdType>();

  readonly subscriptions = {
    oneEntitySubscription: async <Q extends IQuery<Entity>>(
      socket: Socket,
      channel: string,
      id: IdType,
      query: IExactQuery<Entity, Q>
    ) => {
      const listener = () => {
        const relations = createTypeormRelationsArray(query);
        return this._repo.findOneOrFail(id, { relations });
      };
      return this._gatewaysStorage.provisionIdsSubscription({ socket, channel, listener, query });
    },

    manyEntitiesSubscription: async <Q extends IQuery<Entity>>(
      socket: Socket,
      channel: string,
      ids: IdType[],
      query: IExactQuery<Entity, Q>
    ) => {
      const listener = () => {
        const relations = createTypeormRelationsArray(query);
        return this._repo.findByIds(ids, { relations });
      };
      return this._gatewaysStorage.provisionIdsSubscription({ socket, channel, listener, query });
    },

    querySubscription: async <Q extends IQuery<Entity>>(
      socket: Socket,
      channel: string,
      query: IExactQuery<Entity, Q>,
      options?: Omit<FindManyOptions<Entity>, 'relations'>
    ) => {
      const listener = async () => this._provisionQuery(query, options);
      return this._gatewaysStorage.provisionQuerySubscription({ socket, channel, listener, query });
    },

    onDisconnect: (socket: Socket) => {
      return this._gatewaysStorage.removeListener(socket);
    },
  };

  constructor(
    /** Note: Calling mutating functions here will not trigger repo subscribers. */
    protected readonly _repo: Repository<Entity>
  ) {}

  async findOneOrFail(id: IdType): Promise<IProps<Entity>>;
  async findOneOrFail<Q extends IQuery<Entity>>(
    id: IdType,
    query: IExactQuery<Entity, Q>
  ): Promise<IParser<Entity, Q>>;
  async findOneOrFail<Q extends IQuery<Entity>>(id: IdType, query?: IExactQuery<Entity, Q>) {
    if (query) {
      const relations = createTypeormRelationsArray(query);
      const dbRes = await this._repo.findOneOrFail(id, { relations });
      return parseQuery(query, dbRes);
    } else {
      return this._repo.findOneOrFail(id) as unknown as Promise<IProps<Entity>>;
    }
  }

  async findOne(id: IdType): Promise<IProps<Entity> | undefined>;
  async findOne<Q extends IQuery<Entity>>(
    id: IdType,
    query: IExactQuery<Entity, Q>
  ): Promise<IParser<Entity, Q> | undefined>;
  async findOne<Q extends IQuery<Entity>>(id: IdType, query?: IExactQuery<Entity, Q>) {
    if (query) {
      const relations = createTypeormRelationsArray(query);
      const dbRes = await this._repo.findOne(id, { relations });
      return parseQuery(query, dbRes);
    } else {
      return this._repo.findOne(id) as unknown as Promise<IProps<Entity> | undefined>;
    }
  }

  async findMany(ids: IdType[]): Promise<IProps<Entity>[]>;
  async findMany<Q extends IQuery<Entity>>(
    ids: IdType[],
    query: IExactQuery<Entity, Q>
  ): Promise<IParser<Entity[], Q>>;
  async findMany<Q extends IQuery<Entity>>(ids: IdType[], query?: IExactQuery<Entity, Q>) {
    if (ids.length === 0) return [] as unknown as IParser<Entity[], Q>;
    if (query) {
      const relations = createTypeormRelationsArray(query);
      const dbRes = await this._repo.findByIds(ids, { relations });
      return parseQuery(query, dbRes);
    } else {
      return this._repo.findByIds(ids) as unknown as Promise<IProps<Entity>[]>;
    }
  }

  async findAll(): Promise<IProps<Entity>[]>;
  async findAll<Q extends IQuery<Entity>>(query: IExactQuery<Entity, Q>): Promise<IParser<Entity[], Q>>;
  async findAll<Q extends IQuery<Entity>>(query?: IExactQuery<Entity, Q>) {
    if (query) {
      const relations = createTypeormRelationsArray(query);
      const dbRes = await this._repo.find({ relations });
      return parseQuery(query, dbRes);
    } else {
      return this._repo.find() as unknown as Promise<IProps<Entity>[]>;
    }
  }

  async query<Q extends IQuery<Entity>>(
    query: IExactQuery<Entity, Q>,
    options?: Omit<FindManyOptions<Entity>, 'relations'>
  ): Promise<IParser<Entity[], Q>> {
    const entities = await this._provisionQuery(query, options);
    return parseQuery(query, entities) as IParser<Entity[], Q>;
  }

  private async _provisionQuery<Q extends IQuery<Entity>>(
    query: IExactQuery<Entity, Q>,
    options?: Omit<FindManyOptions<Entity>, 'relations'>
  ): Promise<Pagination<Entity> | Entity[]> {
    let entities: Pagination<Entity> | Entity[];
    const relations = createTypeormRelationsArray(query);

    const paginateOptions = (query as IPaginate)[ORCHA_PAGINATE];
    if (paginateOptions) {
      entities = await paginate(
        this._repo,
        { page: paginateOptions[ORCHA_PAGE], limit: paginateOptions[ORCHA_LIMIT] },
        { ...options, relations }
      );
    } else {
      entities = await this._repo.find({ ...options, relations });
    }
    return entities;
  }

  async update(id: IdType, entity: IUpdateEntity<Entity>): Promise<IProps<Entity>>;
  async update<Q extends IQuery<Entity>>(
    id: IdType,
    entity: IUpdateEntity<Entity>,
    query: IExactQuery<Entity, Q>
  ): Promise<IParser<Entity, Q>>;
  async update<Q extends IQuery<Entity>>(
    id: IdType,
    entity: IUpdateEntity<Entity>,
    query?: IExactQuery<Entity, Q>
  ) {
    await this._repo.save({ ...(entity as unknown as DeepPartial<Entity>), id });
    this._gatewaysStorage.trigger(id);
    return query ? this.findOneOrFail(id, query) : this.findOneOrFail(id);
  }

  async upsert(entity: IUpsertEntity<Entity>): Promise<IProps<Entity>>;
  async upsert<Q extends IQuery<Entity>>(
    entity: IUpsertEntity<Entity>,
    query: IExactQuery<Entity, Q>
  ): Promise<IParser<Entity, Q>>;
  async upsert<Q extends IQuery<Entity>>(entity: IUpsertEntity<Entity>, query?: IExactQuery<Entity, Q>) {
    await this._repo.save(entity as unknown as DeepPartial<Entity>);
    this._gatewaysStorage.trigger(entity.id as IdType);
    return query ? this.findOneOrFail(entity.id as IdType, query) : this.findOneOrFail(entity.id as IdType);
  }

  async upsertMany(entities: IUpsertEntity<Entity>[]): Promise<IProps<Entity>[]>;
  async upsertMany<Q extends IQuery<Entity>>(
    entities: IUpsertEntity<Entity>[],
    query: IExactQuery<Entity, Q>
  ): Promise<IParser<Entity[], Q>>;
  async upsertMany<Q extends IQuery<Entity>>(
    entities: IUpsertEntity<Entity>[],
    query?: IExactQuery<Entity, Q>
  ) {
    if (entities.length === 0) return [] as unknown as IParser<Entity[], Q>;
    await this._repo.save(entities as unknown as DeepPartial<Entity>[]);
    const ids = entities.map((e) => e.id) as IdType[];
    this._gatewaysStorage.trigger(ids);
    return query ? this.findMany(ids, query) : this.findMany(ids);
  }

  async delete(id: IdType): Promise<IdType> {
    await this._repo.delete(id);
    this._gatewaysStorage.trigger(id);
    return id;
  }

  async deleteMany(ids: IdType[]): Promise<IdType[]> {
    if (ids.length === 0) return [];
    await this._repo.delete(ids as string[]);
    this._gatewaysStorage.trigger(ids);
    return ids;
  }
}
