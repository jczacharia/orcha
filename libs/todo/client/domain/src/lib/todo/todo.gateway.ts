import { ITodoGateway, OrchaTodoExampleAppGateways } from '@orcha/todo/shared/domain';
import { ClientGateway, ClientSubscription, IClientGateway } from '@orcha/angular';

@ClientGateway(OrchaTodoExampleAppGateways.todo)
export class TodoGateway implements IClientGateway<ITodoGateway> {
  @ClientSubscription()
  listen!: IClientGateway<ITodoGateway>['listen'];
  @ClientSubscription()
  listenOne!: IClientGateway<ITodoGateway>['listenOne'];
  @ClientSubscription()
  updateAndListenOne!: IClientGateway<ITodoGateway>['listenOne'];
}
