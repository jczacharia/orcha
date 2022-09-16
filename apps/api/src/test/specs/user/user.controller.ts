import { INestApplication } from '@nestjs/common';
import { createNestjsTestController, ITestController, TestController, TestOperation } from '@orcha/testing';
import { IUserController, USER_CONTROLLER_NAME } from '@todo-example-app-lib/shared';

@TestController(USER_CONTROLLER_NAME)
class UserController implements ITestController<IUserController> {
  @TestOperation()
  signUp!: ITestController<IUserController>['signUp'];
  @TestOperation()
  login!: ITestController<IUserController>['login'];
  @TestOperation()
  getProfile!: ITestController<IUserController>['getProfile'];
  @TestOperation()
  updateProfilePic!: ITestController<IUserController>['updateProfilePic'];
  @TestOperation({ type: 'event' })
  event!: ITestController<IUserController>['event'];
  @TestOperation({ type: 'query' })
  queryProfile!: ITestController<IUserController>['queryProfile'];
}

export function createUserController(app: INestApplication) {
  return createNestjsTestController(app, UserController);
}
