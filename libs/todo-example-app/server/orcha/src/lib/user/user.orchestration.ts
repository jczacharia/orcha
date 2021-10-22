import { UserService } from '@orcha-todo-example-app/server/core/services';
import {
  EntireProfile,
  IUserOrchestration,
  LoginDto,
  LoginQueryModel,
  OrchaTodoExampleAppOrchestrations,
  SignUpDto,
  SignUpQueryModel,
  User,
} from '@orcha-todo-example-app/shared/domain';
import { IQuery } from '@orcha/common';
import { IServerOrchestration, ServerOperation, ServerOrchestration } from '@orcha/nestjs';

@ServerOrchestration(OrchaTodoExampleAppOrchestrations.user)
export class UserOrchestration implements IServerOrchestration<IUserOrchestration> {
  constructor(private readonly _user: UserService) {}

  @ServerOperation({ validateQuery: LoginQueryModel })
  login(query: IQuery<{ token: string }>, _: string, { id, password }: LoginDto) {
    return this._user.login(id, password, query);
  }

  @ServerOperation({ validateQuery: SignUpQueryModel })
  signUp(query: IQuery<{ token: string }>, _: string, { id, password }: SignUpDto) {
    return this._user.signUp(id, password, query);
  }

  @ServerOperation({ validateQuery: EntireProfile })
  getProfile(query: IQuery<User>, token: string) {
    return this._user.verifyUserToken(token, query);
  }
}
