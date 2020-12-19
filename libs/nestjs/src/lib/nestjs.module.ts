import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { IOperations, ISubscriptions } from '@kirtan/common';
import { IKirtanRepository } from '@kirtan/typeorm';

@Module({})
export class KirtanNestJSModule {
  static forRoot<Repo extends new (...args: any[]) => IKirtanRepository<any, any>>({
    operators,
    subscriptions,
    entities,
    repositories,
    dbConfig,
  }: {
    operators?: IOperations[];
    subscriptions?: ISubscriptions[];
    entities?: EntityClassOrSchema[];
    repositories?: Repo[];
    dbConfig: TypeOrmModuleOptions;
  }): DynamicModule {
    return {
      module: KirtanNestJSModule,
      imports: [TypeOrmModule.forRoot(dbConfig), TypeOrmModule.forFeature(entities)],
      providers: [...(subscriptions ?? []), ...(repositories ?? [])] as any,
      controllers: operators as any,
      exports: subscriptions as any,
    };
  }

  static forFeature<Repo extends new (...args: any[]) => IKirtanRepository<any, any>>({
    operators,
    subscriptions,
    entities,
    repositories,
  }: {
    operators?: IOperations[];
    subscriptions?: ISubscriptions[];
    entities?: EntityClassOrSchema[];
    repositories?: Repo[];
  }): DynamicModule {
    return {
      module: KirtanNestJSModule,
      imports: [TypeOrmModule.forFeature(entities)],
      providers: [...(subscriptions ?? []), ...(repositories ?? [])] as any,
      controllers: operators as any,
      exports: subscriptions as any,
    };
  }
}
