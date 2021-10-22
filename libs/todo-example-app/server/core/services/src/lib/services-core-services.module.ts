import { Global, Module, Provider } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ServicesCoreDomainModule } from '@orcha-todo-example-app/server/core/domain';
import { TagService } from './tag';
import { TodoService } from './todo';
import { DbTransactionCreator } from './transaction-creator/transaction-creator.service';
import { UserService } from './user';

const services: Provider[] = [TodoService, UserService, TagService, DbTransactionCreator];

@Global()
@Module({
  imports: [
    ServicesCoreDomainModule,
    JwtModule.register({
      secret: 'secretKey',
      signOptions: { expiresIn: '14d' },
    }),
  ],
  providers: services,
  exports: services,
})
export class ServicesCoreServicesModule {}
