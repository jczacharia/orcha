import { IGateway, IOrchestration } from '@kirtan/common';
import { DynamicModule, Module, Type } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { KirtanOperationErrorFilter } from './kirtan.filter';

@Module({
  providers: [{ provide: APP_FILTER, useClass: KirtanOperationErrorFilter }],
})
export class KirtanModule {
  static forFeature({
    orchestrations,
    gateways,
  }: {
    orchestrations?: Type<IOrchestration>[];
    gateways?: Type<IGateway>[];
  }): DynamicModule {
    if (orchestrations?.length === 0 && gateways?.length === 0) {
      throw new Error('Please include at least one Orchestration or Gateway in the KirtanModule.');
    }

    return {
      module: KirtanModule,
      providers: gateways,
      controllers: orchestrations,
      exports: gateways,
    };
  }
}
