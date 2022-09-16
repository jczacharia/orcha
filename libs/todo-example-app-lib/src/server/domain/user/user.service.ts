import { IExactQuery, IQuery } from '@orcha/common';
import { nanoid } from 'nanoid';
import { EntireProfile, LoginDto, SignUpDto, UpdateUserProfileDto, User } from '../../../shared/domain/user';
import { AuthPort } from '../auth/auth.port';
import { UserRepoPort } from './user-repo.port';

export class UserService {
  constructor(private userRepo: UserRepoPort, private auth: AuthPort) {}

  async login({ email, password }: LoginDto) {
    const user = await this.userRepo.findByEmail(email, { passwordHash: true, salt: true });

    if (!user) {
      throw new Error(`User with email "${email}" does not exist.`);
    }

    const compare = await this.auth.comparePasswords(password, user.passwordHash, user.salt);
    if (!compare) {
      throw new Error(`Incorrect password.`);
    }

    await this.userRepo.updateOne(user.id, { dateLastLoggedIn: new Date() }, {});

    const token = this.auth.sign({ userId: user.id });
    return { token };
  }

  async signUp({ email, password }: SignUpDto) {
    const conflictingUser = await this.userRepo.findByEmail(email, { email: true });

    if (conflictingUser) {
      throw new Error(`User with email "${conflictingUser.email}" already exists.`);
    }

    const salt = nanoid();
    const passwordHash = await this.auth.hash(password, salt);

    const user = await this.userRepo.createOne(
      {
        id: nanoid(),
        dateCreated: new Date(),
        dateUpdated: new Date(),
        email,
        passwordHash,
        salt,
      },
      {}
    );

    const token = this.auth.sign({ userId: user.id });
    return { token };
  }

  async updateProfile(token: string, dto: UpdateUserProfileDto) {
    const user = await this.verifyUserToken(token, {});
    return this.userRepo.updateOne(
      user.id,
      {
        ...dto,
        dateUpdated: new Date(),
      },
      EntireProfile
    );
  }

  async getProfile(token: string) {
    return this.verifyUserToken(token, EntireProfile);
  }

  async queryProfile(token: string, query: IQuery<User>) {
    return this.verifyUserToken(token, query);
  }

  /**
   * Authenticates a user by token.
   * @param token User auth token.
   * @returns The user entity associated with the token.
   */
  async verifyUserToken<Q extends IQuery<User>>(token: string, query: IExactQuery<User, Q>) {
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
      return await this.userRepo.findOneOrFail(userId, query);
    } catch (error) {
      console.error(error);
      throw new Error(`Auth token validation failed: No user found with id "${userId}".`);
    }
  }
}
