import { IServerOrchestration, ServerOperation, ServerOrchestrationController } from '@orcha/nestjs';
import { UserService } from '@todo-example-app-lib/server';
import {
  IUserOrchestration,
  LoginDto,
  SignUpDto,
  USER_ORCHESTRATION_NAME,
} from '@todo-example-app-lib/shared';

@ServerOrchestrationController(USER_ORCHESTRATION_NAME)
export class UserOrchestration implements IServerOrchestration<IUserOrchestration> {
  constructor(private user: UserService) {}

  @ServerOperation()
  login(_: string, dto: LoginDto) {
    return this.user.login(dto);
  }

  @ServerOperation()
  signUp(_: string, dto: SignUpDto) {
    return this.user.signUp(dto);
  }

  @ServerOperation()
  getProfile(token: string) {
    return this.user.getProfile(token);
  }

  @ServerOperation()
  updateProfilePic(token: string, _: null, file: Express.Multer.File[]) {
    console.log(file);
    return {} as any;
  }
}
