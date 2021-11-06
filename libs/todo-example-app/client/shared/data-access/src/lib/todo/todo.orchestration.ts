import { ITodoOrchestration, OrchaTodoExampleAppOrchestrations } from '@orcha-todo-example-app/shared/domain';
import { ClientOperation, ClientOrchestration, IClientOrchestration } from '@orcha/angular';

@ClientOrchestration(OrchaTodoExampleAppOrchestrations.todo)
export class TodoOrchestration implements IClientOrchestration<ITodoOrchestration> {
  @ClientOperation()
  create!: IClientOrchestration<ITodoOrchestration>['create'];
  @ClientOperation()
  update!: IClientOrchestration<ITodoOrchestration>['update'];
  @ClientOperation()
  delete!: IClientOrchestration<ITodoOrchestration>['delete'];
  @ClientOperation()
  tag!: IClientOrchestration<ITodoOrchestration>['tag'];
  @ClientOperation()
  untag!: IClientOrchestration<ITodoOrchestration>['untag'];
}
