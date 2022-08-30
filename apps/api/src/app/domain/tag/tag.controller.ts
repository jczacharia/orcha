import { IServerController, ServerOperation, ServerController } from '@orcha/nestjs';
import { TagService } from '@todo-example-app-lib/server';
import { ITagController, TAG_CONTROLLER_NAME } from '@todo-example-app-lib/shared';

@ServerController(TAG_CONTROLLER_NAME)
export class TagController implements IServerController<ITagController> {
  constructor(private tagService: TagService) {}

  @ServerOperation()
  getMine(token: string) {
    return this.tagService.getMine(token);
  }
}
