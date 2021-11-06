import { ITagGateway, OrchaTodoExampleAppGateways } from '@orcha-todo-example-app/shared/domain';
import { ClientGateway, ClientSubscription, IClientGateway } from '@orcha/angular';

@ClientGateway(OrchaTodoExampleAppGateways.tag)
export class TagGateway implements IClientGateway<ITagGateway> {
  @ClientSubscription()
  read!: IClientGateway<ITagGateway>['read'];
}
