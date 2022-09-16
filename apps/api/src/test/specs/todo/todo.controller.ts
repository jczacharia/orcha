import { INestApplication } from '@nestjs/common';
import { createNestjsTestController, ITestController, TestController, TestOperation } from '@orcha/testing';
import { ITodoController, TODO_CONTROLLER_NAME } from '@todo-example-app-lib/shared';

@TestController(TODO_CONTROLLER_NAME)
class TodoController implements ITestController<ITodoController> {
  @TestOperation()
  getMine!: ITestController<ITodoController>['getMine'];
  @TestOperation()
  create!: ITestController<ITodoController>['create'];
  @TestOperation()
  update!: ITestController<ITodoController>['update'];
  @TestOperation()
  delete!: ITestController<ITodoController>['delete'];
  @TestOperation()
  tag!: ITestController<ITodoController>['tag'];
  @TestOperation()
  untag!: ITestController<ITodoController>['untag'];
  @TestOperation()
  paginateAll!: ITestController<ITodoController>['paginateAll'];
}

export function createTodoController(app: INestApplication) {
  return createNestjsTestController(app, TodoController);
}
