import { INestApplication } from '@nestjs/common';
import {
  createNestjsTestOrchestration,
  ITestOrchestration,
  TestOperation,
  TestOrchestration,
} from '@orcha/testing';
import { ITodoOrchestration, TODO_ORCHESTRATION_NAME } from '@todo-example-app-lib/shared';

@TestOrchestration(TODO_ORCHESTRATION_NAME)
class TodoOrchestration implements ITestOrchestration<ITodoOrchestration> {
  @TestOperation()
  getMine!: ITestOrchestration<ITodoOrchestration>['getMine'];
  @TestOperation()
  create!: ITestOrchestration<ITodoOrchestration>['create'];
  @TestOperation()
  update!: ITestOrchestration<ITodoOrchestration>['update'];
  @TestOperation()
  delete!: ITestOrchestration<ITodoOrchestration>['delete'];
  @TestOperation()
  tag!: ITestOrchestration<ITodoOrchestration>['tag'];
  @TestOperation()
  untag!: ITestOrchestration<ITodoOrchestration>['untag'];
  @TestOperation()
  paginateAll!: ITestOrchestration<ITodoOrchestration>['paginateAll'];
}

export function createTodoOrchestration(app: INestApplication) {
  return createNestjsTestOrchestration(app, TodoOrchestration);
}
