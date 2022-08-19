import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { environment } from '@todo-example-app-lib/shared';
import { UserModule } from './domain/user/user.module';

@Module({
  imports: [
    MikroOrmModule.forRoot(environment.mikroOrmConfig),
    UserModule,
  ],
})
export class AppModule {}
