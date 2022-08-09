import { ITagGateway, OrchaTodoExampleAppGateways } from '@orcha/todo/shared/domain';
import { ClientGateway, ClientSubscription, IClientGateway } from '@orcha/angular';

@ClientGateway(OrchaTodoExampleAppGateways.tag)
export class TagGateway implements IClientGateway<ITagGateway> {
  @ClientSubscription()
  listen!: IClientGateway<ITagGateway>['listen'];
}
