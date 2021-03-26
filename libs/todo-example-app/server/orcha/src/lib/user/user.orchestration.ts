import { UserService } from '@orcha-todo-example-app/server/core/services';
import {
  IUserOrchestration,
  LoginDto,
  LoginQueryModel,
  OrchaTodoExampleAppOrchestrations,
  SignUpDto,
  SignUpQueryModel,
  User,
  UserQueryModel,
} from '@orcha-todo-example-app/shared/domain';
import { IQuery } from '@orcha/common';
import { IServerOrchestration, ServerOperation, ServerOrchestration } from '@orcha/nestjs';

@ServerOrchestration(OrchaTodoExampleAppOrchestrations.user)
export class UserOrchestration implements IServerOrchestration<IUserOrchestration> {
  constructor(private readonly user: UserService) {}

  @ServerOperation({ validateQuery: LoginQueryModel })
  login(query: IQuery<{ token: string }>, _: string, { id, password }: LoginDto) {
    return this.user.login(id, password, query);
  }

  @ServerOperation({ validateQuery: SignUpQueryModel })
  signUp(query: IQuery<{ token: string }>, _: string, { id, password }: SignUpDto) {
    return this.user.signUp(id, password, query);
  }

  @ServerOperation({ validateQuery: UserQueryModel })
  getProfile(query: IQuery<User>, token: string) {
    return this.user.verifyUserToken(token, query);
  }
}
