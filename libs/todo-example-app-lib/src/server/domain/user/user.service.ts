import { nanoid } from 'nanoid';
import { EntireProfile, LoginDto, SignUpDto, User } from '../../../shared/domain/user';
import { AuthPort } from '../auth/auth.port';
import { UserRepoPort } from './user-repo.port';

export class UserService {
  constructor(private userRepo: UserRepoPort, private auth: AuthPort) {}

  async login({ email, password }: LoginDto) {
    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      throw new Error(`User with email "${email}" does not exist.`);
    }

    const compare = await this.auth.comparePasswords(password, user.passwordHash, user.salt);
    if (!compare) {
      throw new Error(`Incorrect password.`);
    }

    user.dateLastLoggedIn = new Date();
    await this.userRepo.updateProps(user.id, { dateLastLoggedIn: new Date() });

    const token = this.auth.sign({ userId: user.id });
    return { token };
  }

  async signUp({ email, password }: SignUpDto) {
    const conflictingUser = await this.userRepo.findByEmail(email);

    if (conflictingUser?.email) {
      throw new Error(`User with email "${conflictingUser.email}" already exists.`);
    }

    const salt = nanoid();
    const passwordHash = await this.auth.hash(password, salt);

    const user = await this.userRepo.createUser(email, passwordHash, salt);

    const token = this.auth.sign({ userId: user.id });
    return { token };
  }

  async getProfile(token: string) {
    const userId = await this.verifyUserToken(token);
    return this.userRepo.orchaFindOneOrFail(userId, EntireProfile);
  }

  /**
   * Authenticates a user by token.
   * @param token User auth token.
   * @returns The user entity associated with the token.
   */
  async verifyUserToken(token?: string) {
    if (!token) {
      throw new Error(`Unable to verify authentication token. No Token given.`);
    }

    let userId: User['id'] | undefined;

    try {
      userId = (await this.auth.getTokenOwner(token)).userId;
    } catch (e) {
      throw new Error(e as string);
    }

    if (!userId) {
      throw new Error(`Unable to verify authentication token. No user associated with given token.`);
    }

    try {
      await this.userRepo.findOneOrFail(userId);
      return userId;
    } catch (error) {
      console.error(error);
      throw new Error(`Auth token validation failed: No user found with id "${userId}".`);
    }
  }
}
