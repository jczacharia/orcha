import { INestApplication } from '@nestjs/common';
import { ITodoGateway, OrchaTodoExampleAppGateways } from '@orcha/todo/shared/domain';
import { IClientGateway } from '@orcha/angular';
import { createNestjsTestGateway, TestGateway, TestSubscription } from '@orcha/testing';

@TestGateway(OrchaTodoExampleAppGateways.todo)
export class TodoGateway implements IClientGateway<ITodoGateway> {
  @TestSubscription()
  listen!: IClientGateway<ITodoGateway>['listen'];
  @TestSubscription()
  listenOne!: IClientGateway<ITodoGateway>['listenOne'];
  @TestSubscription()
  updateAndListenOne!: IClientGateway<ITodoGateway>['listenOne'];
}

export function createTodoGateway(app: INestApplication) {
  return createNestjsTestGateway(app, TodoGateway);
}
