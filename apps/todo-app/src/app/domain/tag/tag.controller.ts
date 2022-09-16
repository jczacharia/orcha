import { IClientController } from '@orcha/angular';
import { ClientController, ClientOperation } from '@orcha/common';
import { ITagController, TAG_CONTROLLER_NAME } from '@todo-example-app-lib/shared';

@ClientController(TAG_CONTROLLER_NAME)
export class TagController implements IClientController<ITagController> {
  @ClientOperation()
  getMine!: IClientController<ITagController>['getMine'];
}
