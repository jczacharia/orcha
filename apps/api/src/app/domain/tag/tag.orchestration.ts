import { IServerOrchestration, Operation, OrchestrationController } from '@orcha/nestjs';
import { TagService } from '@todo-example-app-lib/server';
import { ITagOrchestration, TAG_ORCHESTRATION_NAME } from '@todo-example-app-lib/shared';

@OrchestrationController(TAG_ORCHESTRATION_NAME)
export class TagOrchestration implements IServerOrchestration<ITagOrchestration> {
  constructor(private tagService: TagService) {}

  @Operation()
  getMine(token: string) {
    return this.tagService.getMine(token);
  }
}
