import { IOperations, ISubscriptions } from '@kirtan/common';
import { DynamicModule, Module, Type } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { KirtanOperationErrorFilter } from './kirtan.filter';

@Module({
  providers: [{ provide: APP_FILTER, useClass: KirtanOperationErrorFilter }],
})
export class KirtanModule {
  static forFeature({
    operators,
    subscriptions,
  }: {
    operators?: Type<IOperations>[];
    subscriptions?: Type<ISubscriptions>[];
  }): DynamicModule {
    if (operators?.length === 0 && subscriptions?.length === 0) {
      throw new Error('Please include at least one operation or subscription in the KirtanModule.');
    }

    return {
      module: KirtanModule,
      providers: subscriptions,
      controllers: operators,
      exports: subscriptions,
    };
  }
}
