import { IOperation } from '@orcha/common';
import { LoginDto, SignUpDto } from './user.dtos';
import { User } from './user.model';

export interface IUserOrchestration {
  login: IOperation<{ token: string }, LoginDto>;
  signUp: IOperation<{ token: string }, SignUpDto>;
  getProfile: IOperation<User>;
  updateProfilePic: IOperation<User, null, File[]>;
}
