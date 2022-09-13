import { EntityManager, FilterQuery, FlushMode, MikroORM, wrap } from '@mikro-orm/core';
import { ICreateEntity, IOrchaModel, OrchaDbTransactionalPort } from '@orcha/common';
import { IOrchaMikroOrmEntity } from './mikro-orm-orcha-entity';
import { IOrchaMikroOrmRepository } from './mikro-orm.repository-interface';

export class OrchaMikroOrmTransactional implements OrchaDbTransactionalPort {
  forked!: EntityManager;

  constructor(private orm: MikroORM) {}

  async runInTransaction(fn: (t: OrchaDbTransactionalPort) => Promise<void>): Promise<void> {
    this.forked = this.orm.em.fork({ flushMode: FlushMode.COMMIT });
    await this.forked.begin();
    try {
      await fn(this);
      await this.forked.commit();
    } catch (e) {
      await this.forked.rollback();
      throw e;
    }
  }

  async createOne<
    T extends IOrchaModel<IdType>,
    E extends IOrchaMikroOrmEntity<T>,
    IdType extends string | number = T extends IOrchaModel<infer ID extends string | number> ? ID : never
  >({ repo }: IOrchaMikroOrmRepository<T, E, IdType>, model: ICreateEntity<T>): Promise<void> {
    const entity = repo.create(model as any);
    this.forked.persist(entity);
  }

  async createMany<
    T extends IOrchaModel<IdType>,
    E extends IOrchaMikroOrmEntity<T>,
    IdType extends string | number = T extends IOrchaModel<infer ID extends string | number> ? ID : never
  >(r: IOrchaMikroOrmRepository<T, E, IdType>, models: ICreateEntity<T>[]): Promise<void> {
    for (const m of models) {
      await this.createOne(r, m);
    }
  }

  async updateOne<
    T extends IOrchaModel<IdType>,
    E extends IOrchaMikroOrmEntity<T>,
    IdType extends string | number = T extends IOrchaModel<infer ID extends string | number> ? ID : never
  >(r: IOrchaMikroOrmRepository<T, E, IdType>, id: IdType, changes: ICreateEntity<T>): Promise<void> {
    const entity = await r.repo.findOneOrFail({ id } as FilterQuery<E>);
    this.deleteAllUndefined(changes);
    wrap(entity).assign(changes as any);
    this.forked.persist(entity);
  }

  async updateMany<
    T extends IOrchaModel<IdType>,
    E extends IOrchaMikroOrmEntity<T>,
    IdType extends string | number = T extends IOrchaModel<infer ID> ? ID : never
  >(
    r: IOrchaMikroOrmRepository<T, E, IdType>,
    models: { id: IdType; changes: ICreateEntity<T> }[]
  ): Promise<void> {
    const entities = await r.repo.find({ id: { $in: models.map((m) => m.id) } } as FilterQuery<E>);
    for (const e of entities) {
      const changes = models.find((m) => m.id === (e as any).id);
      if (changes) {
        this.deleteAllUndefined(changes);
        wrap(e).assign(changes as any);
      }
    }
    this.forked.persist(entities);
  }

  async deleteOne<
    T extends IOrchaModel<IdType>,
    E extends IOrchaMikroOrmEntity<T>,
    IdType extends string | number = T extends IOrchaModel<infer ID extends string | number> ? ID : never
  >(r: IOrchaMikroOrmRepository<T, E, IdType>, id: IdType): Promise<void> {
    const entity = await r.repo.findOneOrFail({ id } as FilterQuery<E>);
    this.forked.remove(entity);
  }

  async deleteMany<
    T extends IOrchaModel<IdType>,
    E extends IOrchaMikroOrmEntity<T>,
    IdType extends string | number = T extends IOrchaModel<infer ID> ? ID : never
  >(r: IOrchaMikroOrmRepository<T, E, IdType>, ids: IdType[]): Promise<void> {
    const entities = await r.repo.find({ id: { $in: ids } } as FilterQuery<E>);
    this.forked.remove(entities);
  }

  private deleteAllUndefined(obj: any) {
    Object.keys(obj).forEach((key) => (obj[key] === undefined ? delete obj[key] : {}));
  }
}
