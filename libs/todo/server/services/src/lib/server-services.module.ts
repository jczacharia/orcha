import { Global, Module, Provider } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ServicesDomainModule } from '@orcha/todo/server/domain';
import { TagService } from './tag/tag.service';
import { TodoService } from './todo/todo.service';
import { UserService } from './user/user.service';

const services: Provider[] = [TodoService, UserService, TagService];

@Global()
@Module({
  imports: [
    ServicesDomainModule,
    JwtModule.register({
      secret: 'secretKey',
      signOptions: { expiresIn: '14d' },
    }),
  ],
  providers: services,
  exports: services,
})
export class ServicesServicesModule {}
