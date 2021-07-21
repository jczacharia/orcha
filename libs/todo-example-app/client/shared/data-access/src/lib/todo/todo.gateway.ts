import { ITodoGateway, OrchaTodoExampleAppGateways } from '@orcha-todo-example-app/shared/domain';
import { ClientGateway, ClientSubscription, IClientGateway } from '@orcha/angular';

@ClientGateway(OrchaTodoExampleAppGateways.todo)
export class TodoGateway implements IClientGateway<ITodoGateway> {
  @ClientSubscription()
  read!: IClientGateway<ITodoGateway>['read'];
}
