import { TagService } from '@orcha-todo-example-app/server/core/services';
import {
  ITagOrchestration,
  OrchaTodoExampleAppOrchestrations,
  Tag,
  TagQueryModel,
} from '@orcha-todo-example-app/shared/domain';
import { IQuery } from '@orcha/common';
import { IServerOrchestration, ServerOperation, ServerOrchestration } from '@orcha/nestjs';

@ServerOrchestration(OrchaTodoExampleAppOrchestrations.tag)
export class TagOrchestration implements IServerOrchestration<ITagOrchestration> {
  constructor(private readonly _tag: TagService) {}

  @ServerOperation({ validateQuery: TagQueryModel })
  read(query: IQuery<Tag[]>, token: string) {
    return this._tag.read(query, token);
  }
}
