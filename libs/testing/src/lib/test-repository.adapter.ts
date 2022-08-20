import {
  ICreateEntity,
  IExactQuery,
  IOrchaModel,
  IPaginate,
  IPagination,
  IParser,
  IQuery,
  IUpdateEntity,
  OrchaBaseRepositoryPort,
  parseQuery,
} from '@orcha/common';

export class TestOrchaBaseRepositoryAdapter<
  T extends IOrchaModel<IdType>,
  IdType extends string | number = T extends IOrchaModel<infer ID> ? ID : never
> implements OrchaBaseRepositoryPort<T, IdType>
{
  entities = new Map<IdType, T>();

  async findOne<Q extends IQuery<T>>(id: IdType, query: IExactQuery<T, Q>): Promise<IParser<T, Q> | null> {
    const entity = this.entities.get(id);
    if (!entity) {
      return null;
    }
    return parseQuery(entity, query);
  }

  async findOneOrFail<Q extends IQuery<T>>(id: IdType, query: IExactQuery<T, Q>): Promise<IParser<T, Q>> {
    const entity = this.entities.get(id);
    if (!entity) {
      throw new Error(`Test Entity with ID "${id}" not found.`);
    }
    return parseQuery(entity, query);
  }

  async findMany<Q extends IQuery<T>>(ids: IdType[], query: IExactQuery<T, Q>): Promise<IParser<T[], Q>> {
    const entities = ids.map((id) => this.entities.get(id) as T).filter((e) => e);
    return parseQuery(entities, query);
  }

  async findAll<Q extends IQuery<T>>(query: IExactQuery<T, Q>): Promise<IParser<T[], Q>> {
    const entities = [...this.entities.values()];
    return parseQuery(entities, query);
  }

  async createOne<Q extends IQuery<T>>(
    model: ICreateEntity<T>,
    query: IExactQuery<T, Q>
  ): Promise<IParser<T, Q>> {
    this.entities.set(model.id, model as T);
    return parseQuery(model as T, query);
  }

  async createMany<Q extends IQuery<T>>(
    models: ICreateEntity<T>[],
    query: IExactQuery<T, Q>
  ): Promise<IParser<T[], Q>> {
    models.forEach((m) => this.entities.set(m.id, m as T));
    return parseQuery(models as T[], query);
  }

  async updateOne<Q extends IQuery<T>>(
    id: IdType,
    changes: IUpdateEntity<T>,
    query: IExactQuery<T, Q>
  ): Promise<IParser<T, Q>> {
    const entity = this.entities.get(id);
    if (!entity) {
      throw new Error(`Test Entity with ID "${id}" not found.`);
    }
    const updated = { ...entity, ...changes };
    this.entities.set(id, updated);
    return parseQuery(updated, query);
  }

  async updateMany<Q extends IQuery<T>>(
    models: { id: IdType; changes: IUpdateEntity<T> }[],
    query: IExactQuery<T, Q>
  ): Promise<IParser<T[], Q>> {
    const entities = models.map(({ id, changes }) => {
      const entity = this.entities.get(id);
      if (!entity) {
        throw new Error(`Test Entity with ID "${id}" not found.`);
      }
      const updated = { ...entity, ...changes };
      this.entities.set(id, updated);
      return updated;
    });
    return parseQuery(entities, query);
  }

  async deleteOne(id: IdType): Promise<IdType> {
    const entity = this.entities.get(id);
    if (!entity) {
      throw new Error(`Test Entity with ID "${id}" not found.`);
    }
    this.entities.delete(id);
    return id;
  }

  async deleteMany(ids: IdType[]): Promise<IdType[]> {
    const deletedIds = ids.map((id) => {
      const entity = this.entities.get(id);
      if (!entity) {
        throw new Error(`Test Entity with ID "${id}" not found.`);
      }
      this.entities.delete(id);
      return id;
    });
    return deletedIds;
  }

  async paginateAll<Q extends IQuery<T>>(
    paginate: IPaginate,
    query: IExactQuery<T, Q>
  ): Promise<IPagination<IParser<T, Q>>> {
    const entities = [...this.entities.values()].slice(paginate.offset, paginate.limit);
    return { items: parseQuery(entities, query) as IParser<T, Q>[], count: this.entities.size };
  }
}
