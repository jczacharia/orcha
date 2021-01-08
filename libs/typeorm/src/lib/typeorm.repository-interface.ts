import {
  IDomainModel,
  IPaginate,
  IParser,
  IProps,
  IQuery,
  IUpdateEntity,
  IInsertEntity,
  KIRTAN_LIMIT,
  KIRTAN_PAGE,
  KIRTAN_PAGINATE,
  parseKirtanQuery,
} from '@kirtan/common';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Socket } from 'socket.io';
import { DeepPartial, FindManyOptions, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { createTypeormRelationsArray } from './relations.transform';
import { GatewaysStorage } from './subscription-storage';

/**
 * TODO
 */
export abstract class IKirtanTypeormRepository<
  // eslint-disable-next-line @typescript-eslint/ban-types
  Entity extends IDomainModel<{ id: IdType }, {}>,
  IdType extends string | number = string
> {
  private readonly gatewaysStorage = new GatewaysStorage<Entity, IdType>();

  readonly subscriptions = {
    oneEntitySubscription: async <Q extends IQuery<Entity>>(
      socket: Socket,
      channel: string,
      id: IdType,
      query: Q
    ) => {
      const listener = () => {
        const relations = createTypeormRelationsArray<Entity>(query);
        return this.repo.findOneOrFail(id, { relations });
      };
      return this.gatewaysStorage.provisionIdsSubscription({ socket, channel, listener, query });
    },

    manyEntitiesSubscription: async <Q extends IQuery<Entity>>(
      socket: Socket,
      channel: string,
      ids: IdType[],
      query: Q
    ) => {
      const listener = () => {
        const relations = createTypeormRelationsArray<Entity>(query);
        return this.repo.findByIds(ids, { relations });
      };
      return this.gatewaysStorage.provisionIdsSubscription({ socket, channel, listener, query });
    },

    querySubscription: async <Q extends IQuery<Entity>>(
      socket: Socket,
      channel: string,
      query: Q,
      options?: Omit<FindManyOptions<Entity>, 'relations'>
    ) => {
      const listener = async () => this.provisionQuery(query, options);
      return this.gatewaysStorage.provisionQuerySubscription({ socket, channel, listener, query });
    },

    onDisconnect: (socket: Socket) => {
      return this.gatewaysStorage.removeListener(socket);
    },
  };

  constructor(
    /** Note: Calling mutating functions here will not trigger repo subscribers. */
    protected readonly repo: Repository<Entity>
  ) {}

  async findOneOrFail(id: IdType): Promise<IProps<Entity>>;
  async findOneOrFail<Q extends IQuery<Entity>>(id: IdType, query: Q): Promise<IParser<Entity, Q>>;
  async findOneOrFail<Q extends IQuery<Entity>>(id: IdType, query?: Q) {
    if (query) {
      const relations = createTypeormRelationsArray<Entity>(query);
      const dbRes = await this.repo.findOneOrFail(id, { relations });
      return query ? parseKirtanQuery(query, dbRes) : dbRes;
    } else {
      return (this.repo.findOneOrFail(id) as unknown) as Promise<IProps<Entity>>;
    }
  }

  async findOne(id: IdType): Promise<IProps<Entity> | undefined>;
  async findOne<Q extends IQuery<Entity>>(id: IdType, query: Q): Promise<IParser<Entity, Q> | undefined>;
  async findOne<Q extends IQuery<Entity>>(id: IdType, query?: Q) {
    if (query) {
      const relations = createTypeormRelationsArray<Entity>(query);
      const dbRes = await this.repo.findOne(id, { relations });
      return parseKirtanQuery(query, dbRes) as IParser<Entity, Q> | undefined;
    } else {
      return (this.repo.findOne(id) as unknown) as Promise<IProps<Entity> | undefined>;
    }
  }

  async findMany(ids: IdType[]): Promise<IProps<Entity>[]>;
  async findMany<Q extends IQuery<Entity>>(ids: IdType[], query: Q): Promise<IParser<Entity[], Q>>;
  async findMany<Q extends IQuery<Entity>>(ids: IdType[], query?: Q) {
    if (ids.length === 0) return ([] as unknown) as IParser<Entity[], Q>;
    if (query) {
      const relations = createTypeormRelationsArray<Entity>(query);
      const dbRes = await this.repo.findByIds(ids, { relations });
      return parseKirtanQuery(query, dbRes);
    } else {
      return (this.repo.findByIds(ids) as unknown) as Promise<IProps<Entity>[]>;
    }
  }

  async findAll(): Promise<IProps<Entity>[]>;
  async findAll<Q extends IQuery<Entity>>(query: Q): Promise<IParser<Entity[], Q>>;
  async findAll<Q extends IQuery<Entity>>(query?: Q) {
    if (query) {
      const relations = createTypeormRelationsArray<Entity>(query);
      const dbRes = await this.repo.find({ relations });
      return parseKirtanQuery(query, dbRes);
    } else {
      return (this.repo.find() as unknown) as Promise<IProps<Entity>[]>;
    }
  }

  async query<Q extends IQuery<Entity>>(
    query: Q,
    options?: Omit<FindManyOptions<Entity>, 'relations'>
  ): Promise<IParser<Entity[], Q>> {
    const entities = await this.provisionQuery(query, options);
    return parseKirtanQuery(query, entities) as IParser<Entity[], Q>;
  }

  private async provisionQuery<Q extends IQuery<Entity>>(
    query: Q,
    options?: Omit<FindManyOptions<Entity>, 'relations'>
  ): Promise<Pagination<Entity> | Entity[]> {
    let entities: Pagination<Entity> | Entity[];
    const relations = createTypeormRelationsArray<Entity>(query);

    const paginateOptions = (query as IPaginate)[KIRTAN_PAGINATE];
    if (paginateOptions) {
      entities = await paginate(
        this.repo,
        { page: paginateOptions[KIRTAN_PAGE], limit: paginateOptions[KIRTAN_LIMIT] },
        { ...options, relations }
      );
    } else {
      entities = await this.repo.find({ ...options, relations });
    }
    return entities;
  }

  async update(id: IdType, entity: IUpdateEntity<Entity>): Promise<IProps<Entity>>;
  async update<Q extends IQuery<Entity>>(
    id: IdType,
    entity: IUpdateEntity<Entity>,
    query: Q
  ): Promise<IParser<Entity, Q>>;
  async update<Q extends IQuery<Entity>>(id: IdType, entity: IUpdateEntity<Entity>, query?: Q) {
    await this.repo.save({ ...(entity as any), id });
    this.gatewaysStorage.trigger(id);
    return query ? this.findOneOrFail(id, query) : this.findOneOrFail(id);
  }

  async insert(entity: IInsertEntity<Entity>): Promise<IProps<Entity>>;
  async insert<Q extends IQuery<Entity>>(
    entity: IInsertEntity<Entity>,
    query: Q
  ): Promise<IParser<Entity, Q>>;
  async insert<Q extends IQuery<Entity>>(entity: IInsertEntity<Entity>, query?: Q) {
    await this.repo.save((entity as unknown) as DeepPartial<Entity>);
    this.gatewaysStorage.trigger(entity.id as IdType);
    return query ? this.findOneOrFail(entity.id as IdType, query) : this.findOneOrFail(entity.id as IdType);
  }

  async upsertMany(entities: IInsertEntity<Entity>[]): Promise<IProps<Entity>[]>;
  async upsertMany<Q extends IQuery<Entity>>(
    entities: IInsertEntity<Entity>[],
    query: Q
  ): Promise<IParser<Entity[], Q>>;
  async upsertMany<Q extends IQuery<Entity>>(entities: IInsertEntity<Entity>[], query?: Q) {
    if (entities.length === 0) return ([] as unknown) as IParser<Entity[], Q>;
    await this.repo.save((entities as unknown) as DeepPartial<Entity>[]);
    const ids = entities.map((e) => e.id) as IdType[];
    this.gatewaysStorage.trigger(ids);
    return query ? this.findMany(ids, query) : this.findMany(ids);
  }

  async delete(id: IdType): Promise<IdType> {
    await this.repo.delete(id);
    this.gatewaysStorage.trigger(id);
    return id;
  }

  async deleteMany(ids: IdType[]): Promise<IdType[]> {
    if (ids.length === 0) return [];
    await this.repo.delete(ids as string[]);
    this.gatewaysStorage.trigger(ids);
    return ids;
  }
}
