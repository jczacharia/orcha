import { IClientController } from '@orcha/angular';
import { ClientOperation, ClientController } from '@orcha/common';
import { ITodoController, TODO_CONTROLLER_NAME } from '@todo-example-app-lib/shared';

@ClientController(TODO_CONTROLLER_NAME)
export class TodoController implements IClientController<ITodoController> {
  @ClientOperation()
  getMine!: IClientController<ITodoController>['getMine'];
  @ClientOperation()
  create!: IClientController<ITodoController>['create'];
  @ClientOperation()
  update!: IClientController<ITodoController>['update'];
  @ClientOperation()
  delete!: IClientController<ITodoController>['delete'];
  @ClientOperation()
  tag!: IClientController<ITodoController>['tag'];
  @ClientOperation()
  untag!: IClientController<ITodoController>['untag'];
  @ClientOperation()
  paginateAll!: IClientController<ITodoController>['paginateAll'];
}
