import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ITestOrchestration } from '@orcha/testing';
import { IUserOrchestration } from '@todo-example-app-lib/shared';
import { AppTestModule } from '../../core/app-test.module';
import { DatabaseService } from '../../core/database.service';
import { createUserOrchestration } from './user.orchestration';

describe('User Orchestration Integration Tests', () => {
  let app: INestApplication;
  let db: DatabaseService;

  let userOrcha: ITestOrchestration<IUserOrchestration>;

  const credentials = { email: 'email@email.com', password: 'GoodPwd341' };
  let auth: { body: { data: { token: string } }; statusCode: HttpStatus };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppTestModule],
      providers: [DatabaseService],
    }).compile();

    app = moduleRef.createNestApplication();
    db = moduleRef.get(DatabaseService);

    userOrcha = createUserOrchestration(app);

    await db.setSchema();
    await app.init();
  });

  beforeEach(async () => await db.clearDb());

  afterAll(async () => await app.close());

  describe('signUp', () => {
    it('should signUp', async () => {
      auth = await userOrcha.signUp('', credentials);
      expect(typeof auth.body.data.token).toBe('string');
      expect(auth.statusCode).toBe(HttpStatus.CREATED);
    });
    it('should not signUp if user email already exists', async () => {
      auth = await userOrcha.signUp('', credentials);
      const { error } = await userOrcha.signUp('', credentials);
      expect(error).toBe(`User with email "${credentials.email}" already exists.`);
    });
    it('should not signUp if email pattern matches fails', async () => {
      const { error } = await userOrcha.signUp('', { email: 'ssd', password: 'GoodPwd341' });
      expect(error).toBe(`Validation failed: email must be an email`);
    });
    it('should not signUp if email pattern matches fails', async () => {
      const { error } = await userOrcha.signUp('', { email: 'good@email.com', password: 'bad' });
      expect(error).toBe(`Validation failed: password must be longer than or equal to 6 characters`);
    });
    it('should not signUp if email and password pattern matches fails', async () => {
      const { error } = await userOrcha.signUp('', { email: 'bad', password: 'bad' });
      expect(error).toBe(
        `Validation failed: email must be an email, password must be longer than or equal to 6 characters`
      );
    });
  });
  describe('login', () => {
    it('should login', async () => {
      auth = await userOrcha.signUp('', credentials);
      auth = await userOrcha.login('', credentials);
      expect(typeof auth.body.data.token).toBe('string');
      expect(auth.statusCode).toBe(HttpStatus.CREATED);
    });
    it('should not login with unknown user', async () => {
      const { error } = await userOrcha.login('', { email: 'who@dis.com', password: 'Idk12341!' });
      expect(error).toBe(`User with email "who@dis.com" does not exist.`);
    });
    it('should not login with wrong password', async () => {
      auth = await userOrcha.signUp('', credentials);
      const { error } = await userOrcha.login('', { ...credentials, password: 'wrongPw' });
      expect(error).toBe(`Incorrect password.`);
    });
  });
  describe('getProfile', () => {
    it('should get user data', async () => {
      auth = await userOrcha.signUp('', credentials);
      const { body } = await userOrcha.getProfile(auth.body.data.token);
      expect(body.data.email).toBe(credentials.email);
    });
  });
});
