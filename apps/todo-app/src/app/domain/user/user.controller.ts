import { IClientController } from '@orcha/angular';
import { ClientOperation, ClientController } from '@orcha/common';
import { IUserController, USER_CONTROLLER_NAME } from '@todo-example-app-lib/shared';

@ClientController(USER_CONTROLLER_NAME)
export class UserController implements IClientController<IUserController> {
  @ClientOperation()
  signUp!: IClientController<IUserController>['signUp'];
  @ClientOperation()
  login!: IClientController<IUserController>['login'];
  @ClientOperation()
  getProfile!: IClientController<IUserController>['getProfile'];
  @ClientOperation()
  updateProfilePic!: IClientController<IUserController>['updateProfilePic'];
}
