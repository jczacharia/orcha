import { ITodoOrchestration, OrchaTodoExampleAppOrchestrations } from '@orcha-todo-example-app/shared/domain';
import { ClientOperation, ClientOrchestration, IClientOrchestration } from '@orcha/angular';

@ClientOrchestration(OrchaTodoExampleAppOrchestrations.todo)
export class TodoOrchestration implements IClientOrchestration<ITodoOrchestration> {
  @ClientOperation()
  create!: IClientOrchestration<ITodoOrchestration>['create'];
  @ClientOperation()
  read!: IClientOrchestration<ITodoOrchestration>['read'];
  @ClientOperation()
  update!: IClientOrchestration<ITodoOrchestration>['update'];
  @ClientOperation()
  delete!: IClientOrchestration<ITodoOrchestration>['delete'];
}
