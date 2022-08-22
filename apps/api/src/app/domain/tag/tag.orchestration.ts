import { IServerOrchestration, ServerOperation, ServerOrchestrationController } from '@orcha/nestjs';
import { TagService } from '@todo-example-app-lib/server';
import { ITagOrchestration, TAG_ORCHESTRATION_NAME } from '@todo-example-app-lib/shared';

@ServerOrchestrationController(TAG_ORCHESTRATION_NAME)
export class TagOrchestration implements IServerOrchestration<ITagOrchestration> {
  constructor(private tagService: TagService) {}

  @ServerOperation()
  getMine(token: string) {
    return this.tagService.getMine(token);
  }
}
