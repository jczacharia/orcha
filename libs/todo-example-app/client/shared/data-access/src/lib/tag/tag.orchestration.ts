import { ITagOrchestration, OrchaTodoExampleAppOrchestrations } from '@orcha-todo-example-app/shared/domain';
import { ClientOperation, ClientOrchestration, IClientOrchestration } from '@orcha/angular';

@ClientOrchestration(OrchaTodoExampleAppOrchestrations.tag)
export class TagOrchestration implements IClientOrchestration<ITagOrchestration> {
  @ClientOperation()
  create!: IClientOrchestration<ITagOrchestration>['create'];
  @ClientOperation()
  read!: IClientOrchestration<ITagOrchestration>['read'];
  @ClientOperation()
  update!: IClientOrchestration<ITagOrchestration>['update'];
  @ClientOperation()
  delete!: IClientOrchestration<ITagOrchestration>['delete'];
}
