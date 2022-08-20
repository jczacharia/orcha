import { IClientOrchestration } from '@orcha/angular';
import { ClientOperation, ClientOrchestration } from '@orcha/common';
import { IUserOrchestration, USER_ORCHESTRATION_NAME } from '@todo-example-app-lib/shared';

@ClientOrchestration(USER_ORCHESTRATION_NAME)
export class UserOrchestration implements IClientOrchestration<IUserOrchestration> {
  @ClientOperation()
  signUp!: IClientOrchestration<IUserOrchestration>['signUp'];
  @ClientOperation()
  login!: IClientOrchestration<IUserOrchestration>['login'];
  @ClientOperation()
  getProfile!: IClientOrchestration<IUserOrchestration>['getProfile'];
  @ClientOperation()
  updateProfilePic!: IClientOrchestration<IUserOrchestration>['updateProfilePic'];
}
