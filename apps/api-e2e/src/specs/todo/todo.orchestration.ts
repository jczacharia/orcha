import { INestApplication } from '@nestjs/common';
import { ITodoOrchestration, OrchaTodoExampleAppOrchestrations } from '@orcha-todo-example-app/shared/domain';
import {
  createNestjsTestOrchestration,
  ITestOrchestration,
  TestOperation,
  TestOrchestration,
} from '@orcha/testing';

@TestOrchestration(OrchaTodoExampleAppOrchestrations.todo)
class TodoOrchestration implements ITestOrchestration<ITodoOrchestration> {
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
}

export function createTodoOrchestration(app: INestApplication) {
  return createNestjsTestOrchestration(app, TodoOrchestration);
}
