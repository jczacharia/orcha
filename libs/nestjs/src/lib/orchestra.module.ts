import { IGateway, IOrchestration } from '@orcha/common';
import { DynamicModule, Module, Type } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { OrchestraOperationErrorFilter } from './orchestra.filter';

@Module({
  providers: [{ provide: APP_FILTER, useClass: OrchestraOperationErrorFilter }],
})
export class OrchestraModule {
  static forFeature({
    orchestrations,
    gateways,
  }: {
    orchestrations?: Type<IOrchestration>[];
    gateways?: Type<IGateway>[];
  }): DynamicModule {
    if (orchestrations?.length === 0 && gateways?.length === 0) {
      throw new Error('Please include at least one Orchestration or Gateway in the OrchestraModule.');
    }

    return {
      module: OrchestraModule,
      providers: gateways,
      controllers: orchestrations,
      exports: gateways,
    };
  }
}
