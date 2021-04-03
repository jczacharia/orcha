import {
  ITodoTagOrchestration,
  OrchaTodoExampleAppOrchestrations,
} from '@orcha-todo-example-app/shared/domain';
import { ClientOperation, ClientOrchestration, IClientOrchestration } from '@orcha/angular';

@ClientOrchestration(OrchaTodoExampleAppOrchestrations.todoTag)
export class TodoTagOrchestration implements IClientOrchestration<ITodoTagOrchestration> {
  @ClientOperation()
  create!: IClientOrchestration<ITodoTagOrchestration>['create'];
  @ClientOperation()
  read!: IClientOrchestration<ITodoTagOrchestration>['read'];
  @ClientOperation()
  delete!: IClientOrchestration<ITodoTagOrchestration>['delete'];
}
