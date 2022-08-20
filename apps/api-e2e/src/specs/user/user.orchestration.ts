import { INestApplication } from '@nestjs/common';
import {
  createNestjsTestOrchestration,
  ITestOrchestration,
  TestOperation,
  TestOrchestration,
} from '@orcha/testing';
import { IUserOrchestration, USER_ORCHESTRATION_NAME } from '@todo-example-app-lib/shared';

@TestOrchestration(USER_ORCHESTRATION_NAME)
class UserOrchestration implements ITestOrchestration<IUserOrchestration> {
  @TestOperation()
  signUp!: ITestOrchestration<IUserOrchestration>['signUp'];
  @TestOperation()
  login!: ITestOrchestration<IUserOrchestration>['login'];
  @TestOperation()
  getProfile!: ITestOrchestration<IUserOrchestration>['getProfile'];
  @TestOperation()
  updateProfilePic!: ITestOrchestration<IUserOrchestration>['updateProfilePic'];
}

export function createUserOrchestration(app: INestApplication) {
  return createNestjsTestOrchestration(app, UserOrchestration);
}
