import { DynamicModule, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ServerOperationErrorFilter } from './orcha.filter';
import { OrchaInterceptor } from './orcha.interceptor';

/**
 * Module that imports Orcha NestJS functionalities.
 */
@Module({})
export class OrchaNestModule {
  /**
   * Creates an Orcha feature by grouping relevant controllers.
   */
  static forRoot(): DynamicModule {
    return {
      module: OrchaNestModule,
      providers: [
        {
          provide: APP_INTERCEPTOR,
          useClass: OrchaInterceptor,
        },
        {
          provide: APP_FILTER,
          useClass: ServerOperationErrorFilter,
        },
      ],
    };
  }
}
