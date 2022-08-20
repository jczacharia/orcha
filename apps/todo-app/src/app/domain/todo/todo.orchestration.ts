import { IClientOrchestration } from '@orcha/angular';
import { ClientOperation, ClientOrchestration } from '@orcha/common';
import { ITodoOrchestration, TODO_ORCHESTRATION_NAME } from '@todo-example-app-lib/shared';

@ClientOrchestration(TODO_ORCHESTRATION_NAME)
export class TodoOrchestration implements IClientOrchestration<ITodoOrchestration> {
  @ClientOperation()
  getMine!: IClientOrchestration<ITodoOrchestration>['getMine'];
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
  @ClientOperation()
  paginateAll!: IClientOrchestration<ITodoOrchestration>['paginateAll'];
}
