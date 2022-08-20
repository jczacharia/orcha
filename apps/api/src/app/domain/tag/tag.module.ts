import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { TagRepoPort, TagService, UserService } from '@todo-example-app-lib/server';
import { UserModule } from '../user/user.module';
import { TagRepoAdapter } from './tag-repo.adapter';
import { TagEntity } from './tag.entity';
import { TagOrchestration } from './tag.orchestration';

@Module({
  imports: [UserModule, MikroOrmModule.forFeature({ entities: [TagEntity] })],
  controllers: [TagOrchestration],
  providers: [
    {
      provide: TagRepoPort,
      useClass: TagRepoAdapter,
    },
    {
      inject: [UserService, TagRepoPort],
      provide: TagService,
      useFactory: (userService: UserService, tagRepo: TagRepoPort) => new TagService(userService, tagRepo),
    },
  ],
  exports: [TagRepoPort],
})
export class TagModule {}
