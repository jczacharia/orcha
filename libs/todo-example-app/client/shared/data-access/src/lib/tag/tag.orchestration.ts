import { ITagOrchestration, OrchaTodoExampleAppOrchestrations } from '@orcha-todo-example-app/shared/domain';
import { ClientOperation, ClientOrchestration, IClientOrchestration } from '@orcha/angular';

@ClientOrchestration(OrchaTodoExampleAppOrchestrations.tag)
export class TagOrchestration implements IClientOrchestration<ITagOrchestration> {
  @ClientOperation()
  read!: IClientOrchestration<ITagOrchestration>['read'];
}
