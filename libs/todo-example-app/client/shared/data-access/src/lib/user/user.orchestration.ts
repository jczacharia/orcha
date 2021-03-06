import { IUserOrchestration, OrchaTodoExampleAppOrchestrations } from '@orcha-todo-example-app/shared/domain';
import { ClientOperation, ClientOrchestration, IClientOrchestration } from '@orcha/angular';

@ClientOrchestration(OrchaTodoExampleAppOrchestrations.user)
export class UserOrchestration implements IClientOrchestration<IUserOrchestration> {
  @ClientOperation()
  signUp!: IClientOrchestration<IUserOrchestration>['signUp'];
  @ClientOperation()
  login!: IClientOrchestration<IUserOrchestration>['login'];
  @ClientOperation()
  getProfile!: IClientOrchestration<IUserOrchestration>['getProfile'];
}
