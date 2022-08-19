import { DynamicModule, Module, ModuleMetadata, Type } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { IOrchestration } from '@orcha/common';
import { OrchaOperationErrorFilter } from './orcha.filter';
import { OrchaInterceptor } from './orcha.interceptor';

/**
 * Module that imports Orcha NestJS functionalities.
 */
@Module({})
export class OrchaNestModule {
  /**
   * Creates an Orcha feature by grouping relevant orchestrations and gateways.
   */
  static forFeature({
    orchestrations,
    imports,
    providers,
  }: {
    orchestrations?: Type<IOrchestration>[];
    imports?: ModuleMetadata['imports'];
    providers?: ModuleMetadata['providers'];
  }): DynamicModule {
    if (orchestrations?.length === 0) {
      throw new Error('Must include at least one Orchestration in the OrchaModule.');
    }

    return {
      module: OrchaNestModule,
      controllers: orchestrations,
      imports: [...(imports ? imports : [])],
      providers: [
        {
          provide: APP_INTERCEPTOR,
          useClass: OrchaInterceptor,
        },
        {
          provide: APP_FILTER,
          useClass: OrchaOperationErrorFilter,
        },
        ...(providers ? providers : []),
      ],
      exports: providers,
    };
  }
}
