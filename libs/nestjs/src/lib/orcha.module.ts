import { IGateway, IOrchestration } from '@orcha/common';
import { DynamicModule, Module, Type } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { OrchaOperationErrorFilter } from './orcha.filter';

@Module({
  providers: [{ provide: APP_FILTER, useClass: OrchaOperationErrorFilter }],
})
export class OrchaModule {
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
      module: OrchaModule,
      providers: gateways,
      controllers: orchestrations,
      exports: gateways,
    };
  }
}
