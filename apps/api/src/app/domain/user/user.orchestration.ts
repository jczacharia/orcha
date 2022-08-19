import { IServerOrchestration, ServerOperation, ServerOrchestration } from '@orcha/nestjs';
import { UserService } from '@todo-example-app-lib/server';
import {
  IUserOrchestration,
  LoginDto,
  SignUpDto,
  USER_ORCHESTRATION_NAME,
} from '@todo-example-app-lib/shared';

@ServerOrchestration(USER_ORCHESTRATION_NAME)
export class UserOrchestration implements IServerOrchestration<IUserOrchestration> {
  constructor(private readonly _user: UserService) {}

  @ServerOperation()
  login(_: string, dto: LoginDto) {
    return this._user.login(dto);
  }

  @ServerOperation()
  signUp(_: string, dto: SignUpDto) {
    return this._user.signUp(dto);
  }

  @ServerOperation()
  getProfile(token: string) {
    return this._user.getProfile(token);
  }

  @ServerOperation()
  updateProfilePic(token: string, _: null, file: Express.Multer.File[]) {
    console.log(file);
    return {} as any;
  }
}
