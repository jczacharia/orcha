import { IClientOrchestration } from '@orcha/angular';
import { ClientOperation, ClientOrchestration } from '@orcha/common';
import { ITagOrchestration, TAG_ORCHESTRATION_NAME } from '@todo-example-app-lib/shared';

@ClientOrchestration(TAG_ORCHESTRATION_NAME)
export class TagOrchestration implements IClientOrchestration<ITagOrchestration> {
  @ClientOperation()
  getMine!: IClientOrchestration<ITagOrchestration>['getMine'];
}
