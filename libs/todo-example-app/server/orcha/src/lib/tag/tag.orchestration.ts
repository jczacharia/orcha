import { TagService } from '@orcha-todo-example-app/server/core/services';
import {
  CreateTagDto,
  DeleteTagDto,
  DeleteTagQueryModel,
  ITagOrchestration,
  OrchaTodoExampleAppOrchestrations,
  Tag,
  TagQueryModel,
  UpdateTagDto,
} from '@orcha-todo-example-app/shared/domain';
import { IQuery } from '@orcha/common';
import { IServerOrchestration, ServerOperation, ServerOrchestration } from '@orcha/nestjs';

@ServerOrchestration(OrchaTodoExampleAppOrchestrations.tag)
export class TagOrchestration implements IServerOrchestration<ITagOrchestration> {
  constructor(private readonly tag: TagService) {}

  @ServerOperation({ validateQuery: TagQueryModel })
  create(query: IQuery<Tag>, token: string, dto: CreateTagDto) {
    return this.tag.create(query, token, dto);
  }

  @ServerOperation({ validateQuery: TagQueryModel })
  read(query: IQuery<Tag[]>, token: string) {
    return this.tag.read(query, token);
  }

  @ServerOperation({ validateQuery: TagQueryModel })
  update(query: IQuery<Tag>, token: string, dto: UpdateTagDto) {
    return this.tag.update(query, token, dto);
  }

  @ServerOperation({ validateQuery: DeleteTagQueryModel })
  delete(query: IQuery<{ deletedId: string }>, token: string, dto: DeleteTagDto) {
    return this.tag.delete(query, token, dto);
  }
}
