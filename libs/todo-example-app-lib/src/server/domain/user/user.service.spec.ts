import { IExactQuery, IParser, IQuery, parseQuery } from '@orcha/common';
import { TestOrchaBaseRepositoryAdapter } from '@orcha/testing';
import { FirebaseScrypt } from 'firebase-scrypt';
import { nanoid } from 'nanoid';
import { EntireProfile, User } from '../../../shared/domain/user';
import { AuthPort, Sign } from '../auth';
import { UserRepoPort } from './user-repo.port';
import { UserService } from './user.service';

describe('UserService', () => {
  let userService: UserService;
  let userRepo: TestUserRepo;
  let auth: TestAuthPort;

  beforeEach(() => {
    userRepo = new TestUserRepo();
    auth = new TestAuthPort();
    userService = new UserService(userRepo, auth);
  });

  const signUp = (email: string, password: string) => {
    return userService.signUp({ email, password });
  };

  describe('signUp', () => {
    it('should signUp', async () => {
      await expect(userService.signUp({ email: 'a@a.com', password: 'password' })).resolves.toBeTruthy();
    });
    it('should not signUp if user with email already exists', async () => {
      await expect(userService.signUp({ email: 'a@a.com', password: 'password' })).resolves.toBeTruthy();
      await expect(userService.signUp({ email: 'a@a.com', password: 'password' })).rejects.toThrow(
        `User with email "a@a.com" already exists.`
      );
    });
  });

  describe('login', () => {
    it('should login', async () => {
      await signUp('a@a.com', 'password');
      await expect(userService.login({ email: 'a@a.com', password: 'password' })).resolves.toBeTruthy();
    });
    it('should throw error is no user is found', async () => {
      await signUp('a@a.com', 'password');
      await expect(userService.login({ email: 'b@b.com', password: 'password' })).rejects.toThrow(
        `User with email "b@b.com" does not exist.`
      );
    });
    it('should throw error is password is incorrect', async () => {
      await signUp('a@a.com', 'password');
      await expect(userService.login({ email: 'a@a.com', password: 'wrongPassword' })).rejects.toThrow(
        `Incorrect password.`
      );
    });
    it('should update user Date when logging in', async () => {
      await signUp('a@a.com', 'password');
      const { dateLastLoggedIn } = await userRepo.findByEmailOrFail('a@a.com', { dateLastLoggedIn: true });
      expect(dateLastLoggedIn).toBeFalsy();
      await userService.login({ email: 'a@a.com', password: 'password' });
      const { dateLastLoggedIn: dl2 } = await userRepo.findByEmailOrFail('a@a.com', {
        dateLastLoggedIn: true,
      });
      expect(dl2).not.toBe(dateLastLoggedIn);
    });
  });

  describe('getProfile', () => {
    it('should get profile', async () => {
      const { token } = await signUp('a@a.com', 'password');
      const user = await userRepo.findByEmailOrFail('a@a.com', EntireProfile);
      const profile = await userService.getProfile(token);
      expect(user).toMatchObject(profile);
    });
  });
});

class TestUserRepo extends TestOrchaBaseRepositoryAdapter<User> implements UserRepoPort {
  async findByEmail<Q extends IQuery<User>>(
    email: string,
    query: IExactQuery<User, Q>
  ): Promise<IParser<User, Q> | null> {
    let foundUser: User | null = null;
    for (const user of this.entities.values()) {
      if (user.email === email) {
        foundUser = user;
        break;
      }
    }
    if (!foundUser) {
      return null;
    }
    return parseQuery(foundUser, query);
  }

  async findByEmailOrFail<Q extends IQuery<User>>(
    email: string,
    query: IExactQuery<User, Q>
  ): Promise<IParser<User, Q>> {
    for (const user of this.entities.values()) {
      if (user.email === email) {
        return parseQuery(user, query);
      }
    }
    throw new Error(`User with email "${email}" not found.`);
  }
}

class TestAuthPort implements AuthPort {
  tokens = new Map<string, string>();

  readonly scrypt = new FirebaseScrypt({
    memCost: 14,
    rounds: 8,
    saltSeparator: 'Bw==',
    signerKey: 'qUmhMeByCl+H+YaT4RlH/kri/BLQEkCRrySxVqrODKR8MIhwU49k3WzyZJtr1R3dgQXDPq+7LUmIs+vuFdp8Nw==',
  });

  comparePasswords(password: string, hash: string, salt: string): Promise<boolean> {
    return this.scrypt.verify(password, salt, hash);
  }

  hash(password: string, salt: string): Promise<string> {
    return this.scrypt.hash(password, salt);
  }

  async getTokenOwner(token: string): Promise<Sign> {
    for (const t of this.tokens) {
      if (t[1] === token) {
        return { userId: t[0] };
      }
    }
    throw new Error('No owner found for token.');
  }

  sign(data: Sign): string {
    const token = nanoid();
    this.tokens.set(data.userId, token);
    return token;
  }
}
