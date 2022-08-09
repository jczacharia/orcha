import { DynamicModule, Global, Module, Type } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { IGateway, IOrchestration } from '@orcha/common';
import { OrchaOperationErrorFilter } from './orcha.filter';

/**
 * Module that imports Orcha NestJS functionalities.
 */
@Module({
  providers: [{ provide: APP_FILTER, useClass: OrchaOperationErrorFilter }],
})
export class OrchaNestModule {
  /**
   * Creates an Orcha feature by grouping relevant orchestrations and gateways.
   */
  static forFeature({
    orchestrations,
    gateways,
  }: {
    orchestrations?: Type<IOrchestration>[];
    gateways?: Type<IGateway>[];
  }): DynamicModule {
    if (orchestrations?.length === 0 && gateways?.length === 0) {
      throw new Error('Please include at least one Orchestration or Gateway in the OrchaModule.');
    }

    return {
      module: OrchaNestModule,
      providers: gateways,
      controllers: orchestrations,
      exports: gateways,
    };
  }
}
