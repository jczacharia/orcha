import { IDomainModel, IPaginate, IQuery, KIRTAN_PAGINATE } from '@kirtan/common';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Socket } from 'socket.io';
import { FindManyOptions, Repository } from 'typeorm';
import { createTypeormRelationsArray } from './relations.transform';
import { SubscriptionStorage } from './subscription-storage';

/**
 * TODO
 */
export abstract class IKirtanRepository<
  Entity extends IDomainModel<{ id: IdType }, object>,
  IdType extends string | number = string
> {
  private readonly subscriptionStorage = new SubscriptionStorage<Entity, IdType>();

  readonly subscriptions = {
    oneEntitySubscription: async <Q extends IQuery<Entity>>(
      socket: Socket,
      channel: string,
      id: IdType,
      query: Q
    ) => {
      const listener = () => this.findOneOrFail(id, query);
      return this.subscriptionStorage.provisionIdsSubscription({ socket, channel, listener, query });
    },

    manyEntitiesSubscription: async <Q extends IQuery<Entity>>(
      socket: Socket,
      channel: string,
      ids: IdType[],
      query: Q
    ) => {
      const listener = () => this.findMany(ids, query);
      return this.subscriptionStorage.provisionIdsSubscription({ socket, channel, listener, query });
    },

    querySubscription: async <Q extends IQuery<Entity>>(
      socket: Socket,
      channel: string,
      query: Q,
      options?: Omit<FindManyOptions<Entity>, 'relations'>
    ) => {
      const listener = async () => this.query(query, options);
      return this.subscriptionStorage.provisionQuerySubscription({ socket, channel, listener, query });
    },

    onDisconnect: (socket: Socket) => {
      return this.subscriptionStorage.removeListener(socket);
    },
  };

  constructor(protected readonly repo: Repository<Entity>) {}

  async findOneOrFail<Q extends IQuery<Entity>>(id: IdType, query: Q) {
    const relations = createTypeormRelationsArray<Entity>(query);
    return this.repo.findOneOrFail(id, { relations });
  }

  async findOne<Q extends IQuery<Entity>>(id: IdType, query: Q) {
    const relations = createTypeormRelationsArray<Entity>(query);
    return this.repo.findOne(id, { relations });
  }

  async findMany<Q extends IQuery<Entity>>(ids: IdType[], query: Q) {
    if (ids.length === 0) return [];
    const relations = createTypeormRelationsArray<Entity>(query);
    return this.repo.findByIds(ids, { relations });
  }

  async findAll<Q extends IQuery<Entity>>(query: Q) {
    const relations = createTypeormRelationsArray<Entity>(query);
    return this.repo.find({ relations });
  }

  async query<Q extends IQuery<Entity>>(query: Q, options?: Omit<FindManyOptions<Entity>, 'relations'>) {
    let entities: Pagination<Entity> | Entity[];
    const relations = createTypeormRelationsArray<Entity>(query);

    const paginateOptions = (query as IPaginate)[KIRTAN_PAGINATE];
    if (paginateOptions) {
      entities = await paginate(
        this.repo,
        { page: paginateOptions.__page, limit: paginateOptions.__limit },
        { ...options, relations }
      );
    } else {
      entities = await this.repo.find({ ...options, relations });
    }

    return entities;
  }

  async upsert<Q extends IQuery<Entity>>(entity: Entity, query: Q) {
    const res = await this.repo.save(entity);
    this.subscriptionStorage.trigger(entity.id);
    return res;
  }

  async upsertMany<Q extends IQuery<Entity>>(entities: Entity[], query: Q) {
    if (entities.length === 0) return [];
    await this.repo.save(entities);
    const ids = entities.map((e) => e.id);
    this.subscriptionStorage.trigger(ids);
    return this.findMany(ids, query);
  }

  async delete(id: IdType): Promise<IdType> {
    await this.repo.delete(id);
    this.subscriptionStorage.trigger(id);
    return id;
  }

  async deleteMany(ids: IdType[]): Promise<IdType[]> {
    if (ids.length === 0) return [];
    await this.repo.delete(ids as string[]);
    this.subscriptionStorage.trigger(ids);
    return ids;
  }
}
