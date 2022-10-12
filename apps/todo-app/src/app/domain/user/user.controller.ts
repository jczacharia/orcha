import { IClientController } from '@orcha/angular';
import { ClientController, ClientOperation } from '@orcha/common';
import { IUserController, USER_CONTROLLER_NAME } from '@todo-example-app-lib/shared';

@ClientController(USER_CONTROLLER_NAME)
export class UserController implements IClientController<IUserController> {
  @ClientOperation()
  signUp!: IClientController<IUserController>['signUp'];
  @ClientOperation()
  login!: IClientController<IUserController>['login'];
  @ClientOperation()
  getProfile!: IClientController<IUserController>['getProfile'];
  @ClientOperation({ type: 'file-upload' })
  updateProfilePic!: IClientController<IUserController>['updateProfilePic'];
  @ClientOperation({ type: 'event' })
  event!: IClientController<IUserController>['event'];
  @ClientOperation({ type: 'query' })
  queryProfile!: IClientController<IUserController>['queryProfile'];
  @ClientOperation({ type: 'file-download' })
  fileDownload!: IClientController<IUserController>['fileDownload'];
}
