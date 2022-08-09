import { EntityRepository, FilterQuery, FindOptions, MikroORM, wrap } from '@mikro-orm/core';
import {
  IExactQuery,
  IOrchaModel,
  IPaginate,
  IPagination,
  IParser,
  IQuery,
  ORCHA_PAGINATE,
  parseQuery,
} from '@orcha/common';
import { Socket } from 'socket.io';
import { createMikroOrmRelationsArray } from './relations.transform';
import { GatewaysStorage } from './subscription-storage';

/**
 * Inherits all repository functionalities required to perform CRUD operations on an entity.
 */
export abstract class IOrchaMikroOrmRepository<
  T extends IOrchaModel<IdType>,
  E,
  IdType extends string | number = T extends IOrchaModel<infer ID> ? ID : never
> {
  readonly gatewaysStorage = new GatewaysStorage<T, IdType>();

  constructor(public repo: EntityRepository<E>, public orm: MikroORM) {}

  readonly orcha = {
    subscriptions: {
      querySubscription: async <Q extends IQuery<T>>(
        socket: Socket,
        channel: string,
        orchaQuery: IExactQuery<T, Q>,
        options: FilterQuery<E>
      ) => {
        const listener = async () => {
          const populate = createMikroOrmRelationsArray(orchaQuery);
          const entities = await this.repo.find(options, { populate });
          return entities.map((e) => wrap(e).toJSON() as unknown as T);
        };
        return this.gatewaysStorage.provisionSubscription({ socket, channel, listener, query: orchaQuery });
      },

      onDisconnect: (socket: Socket) => {
        return this.gatewaysStorage.removeListener(socket);
      },
    },

    findOneOrFail: async <Q extends IQuery<T>>(
      id: IdType,
      orchaQuery: IExactQuery<T, Q>
    ): Promise<IParser<T, Q>> => {
      const populate = createMikroOrmRelationsArray(orchaQuery);
      const dbRes = await this.repo.findOneOrFail({ id } as FilterQuery<E>, { populate });
      const json = wrap(dbRes).toJSON();
      return parseQuery<any, any>(orchaQuery, json) as IParser<T, Q>;
    },

    findOne: async <Q extends IQuery<T>>(
      id: IdType,
      orchaQuery: IExactQuery<T, Q>
    ): Promise<IParser<T, Q> | null> => {
      const populate = createMikroOrmRelationsArray(orchaQuery);
      const dbRes = await this.repo.findOne({ id } as FilterQuery<E>, { populate });
      const json = dbRes ? wrap(dbRes).toJSON() : null;
      return parseQuery<any, any>(orchaQuery, json) as IParser<T, Q> | null;
    },

    findMany: async <Q extends IQuery<T>>(
      ids: IdType[],
      orchaQuery: IExactQuery<T, Q>
    ): Promise<IParser<T[], Q>> => {
      const populate = createMikroOrmRelationsArray(orchaQuery);
      const dbRes = await this.repo.find({ id: ids } as FilterQuery<E>, { populate });
      const json = dbRes.map((e) => wrap(e).toJSON());
      return parseQuery<any, any>(orchaQuery, json) as IParser<T[], Q>;
    },

    findAll: async <Q extends IQuery<T>>(orchaQuery: IExactQuery<T, Q>): Promise<IParser<T[], Q>> => {
      const populate = createMikroOrmRelationsArray(orchaQuery);
      const entities = await this.repo.findAll({ populate });
      const json = entities.map((e) => wrap(e).toJSON());
      return parseQuery<any, any>(orchaQuery, json) as IParser<T[], Q>;
    },

    find: async <Q extends IQuery<T>>(
      orchaQuery: IExactQuery<T, Q>,
      query: FilterQuery<E>,
      options?: Omit<FindOptions<E>, 'populate'>
    ): Promise<IParser<T[], Q>> => {
      const populate = createMikroOrmRelationsArray(orchaQuery) as any;
      const entities = await this.repo.find(query, { populate, ...options });
      const json = entities.map((e) => wrap(e).toJSON());
      return parseQuery<any, any>(orchaQuery, json) as IParser<T[], Q>;
    },

    paginate: async <Q extends IQuery<T>>(
      orchaQuery: IExactQuery<T, Q> & IPaginate,
      options?: FilterQuery<E>
    ): Promise<IPagination<IParser<T, Q>>> => {
      if (!orchaQuery.__paginate) {
        throw new Error(
          `The property ${ORCHA_PAGINATE} was not found in the Orcha query. Pagination failed.`
        );
      }
      const p = { ...orchaQuery.__paginate };
      delete (orchaQuery as any).__paginate;
      const populate = createMikroOrmRelationsArray(orchaQuery as IExactQuery<T, Q>);
      const [entities, count] = await this.repo.findAndCount(options || ({} as FilterQuery<E>), {
        populate,
        limit: p.limit,
        offset: p.offset,
      });
      const json = entities.map((e) => wrap(e).toJSON());
      return { items: parseQuery<any, any>(orchaQuery, json) as any, count };
    },
  };
}
