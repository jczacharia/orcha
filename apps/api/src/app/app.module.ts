import { Module } from '@nestjs/common';

import { AppControllers } from './app.controller';

@Module({
  imports: [],
  controllers: [AppControllers],
})
export class AppModule {}
