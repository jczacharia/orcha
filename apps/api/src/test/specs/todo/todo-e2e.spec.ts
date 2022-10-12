import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ITestController } from '@orcha/testing';
import { TagRepoPort, TodoRepoPort } from '@todo-example-app-lib/server';
import { ITodoController, IUserController } from '@todo-example-app-lib/shared';
import { AppTestModule } from '../../core/app-test.module';
import { DatabaseService } from '../../core/database.service';
import { createUserController } from '../user/user.controller';
import { createTodoController } from './todo.controller';

describe('Todo Controller Integration Tests', () => {
  let app: INestApplication;
  let db: DatabaseService;

  let userOrcha: ITestController<IUserController>;
  let todoOrcha: ITestController<ITodoController>;

  let todoRepo: TodoRepoPort;
  let tagRepo: TagRepoPort;

  const credentials = { email: 'email@email.com', password: 'GoodPwd341' };
  let auth: { body: { data: { token: string } }; statusCode: HttpStatus };
  let userId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppTestModule],
      providers: [DatabaseService],
    }).compile();

    app = moduleRef.createNestApplication();
    db = moduleRef.get(DatabaseService);

    userOrcha = createUserController(app);
    todoOrcha = createTodoController(app);

    todoRepo = moduleRef.get(TodoRepoPort);
    tagRepo = moduleRef.get(TagRepoPort);

    await app.init();
  });

  beforeEach(async () => {
    await db.clearDb();
    auth = await userOrcha.signUp('', credentials);
    const user = await userOrcha.getProfile(auth.body.data.token);
    userId = user.body.data.id;
  });

  afterAll(async () => await app.close());

  describe('create', () => {
    it('should create todo', async () => {
      const { body: todo } = await todoOrcha.create(auth.body.data.token, { content: 'content' });
      expect(todo.data.user.email).toBe(credentials.email);
      expect(todo.data.content).toBe('content');
      expect(todo.data.done).toBe(false);
    });
  });
  describe('read', () => {
    it('should get no todos at system init', async () => {
      const {
        body: { data: todos },
      } = await todoOrcha.getMine(auth.body.data.token);
      expect(todos.length).toBe(0);
    });
    it('should get my todo items', async () => {
      await todoOrcha.create(auth.body.data.token, { content: 'content' });
      const {
        body: { data: todos },
      } = await todoOrcha.getMine(auth.body.data.token);
      expect(todos.length).toBe(1);
      expect(todos[0].content).toBe('content');
      expect(todos[0].user.id).toBe(userId);
    });
  });
  describe('update', () => {
    it('should not update if owned by another user', async () => {
      const {
        body: { data: otherUser },
      } = await userOrcha.signUp('', {
        email: 'other@user.com',
        password: 'PAsWd12!',
      });
      const {
        body: { data: otherTodo },
      } = await todoOrcha.create(otherUser.token, { content: 'content' });
      const { error } = await todoOrcha.update(auth.body.data.token, {
        todoId: otherTodo.id,
        content: 'new content',
      });
      expect(error).toBe('You cannot update a todo item for another user.');
    });
    it('should update todo and trim', async () => {
      const {
        body: { data: todo },
      } = await todoOrcha.create(auth.body.data.token, {
        content: '  new content    ',
      });
      const {
        body: { data: updatedTodo },
      } = await todoOrcha.update(auth.body.data.token, {
        todoId: todo.id,
      });
      expect(updatedTodo.content).toBe('new content');
      expect(updatedTodo.user.email).toBe(credentials.email);
    });
    it('should get user profile with todos', async () => {
      const {
        body: { data: todo },
      } = await todoOrcha.create(auth.body.data.token, {
        content: 'new content',
      });
      const {
        body: { data: user },
      } = await userOrcha.getProfile(auth.body.data.token);
      expect(user.todos[0].id).toBe(todo.id);
    });
  });
  describe('delete', () => {
    it('should not delete if owned by another user', async () => {
      const {
        body: { data: otherUser },
      } = await userOrcha.signUp('', {
        email: 'other@user.com',
        password: 'PAsWd12!',
      });
      const {
        body: { data: otherTodo },
      } = await todoOrcha.create(otherUser.token, { content: 'content' });
      const { error } = await todoOrcha.delete(auth.body.data.token, {
        todoId: otherTodo.id,
      });
      expect(error).toBe('You cannot delete a todo item for another user.');
    });
    it('should delete todo', async () => {
      const {
        body: { data: todo },
      } = await todoOrcha.create(auth.body.data.token, {
        content: 'new content',
      });
      const {
        body: { data: deletedTodo },
      } = await todoOrcha.delete(auth.body.data.token, {
        todoId: todo.id,
      });
      expect(deletedTodo.deletedId).toBe(todo.id);
      expect(await todoRepo.findOne(todo.id, {})).toBeFalsy();
    });
    it('should delete todo and all lonely tags', async () => {
      const {
        body: { data: todo },
      } = await todoOrcha.create(auth.body.data.token, {
        content: 'new content',
      });
      const {
        body: { data: taggedTodo },
      } = await todoOrcha.tag(auth.body.data.token, {
        todoId: todo.id,
        tagName: 'tag',
      });
      const {
        body: { data: deletedTodo },
      } = await todoOrcha.delete(auth.body.data.token, {
        todoId: todo.id,
      });
      expect(deletedTodo.deletedId).toBe(todo.id);
      expect(await todoRepo.findOne(todo.id, {})).toBeFalsy();
      expect(await tagRepo.findOne(taggedTodo.taggedTodos[0].tag.id, {})).toBeFalsy();
    });
    it('should delete todo and keep non-lonely tags', async () => {
      const {
        body: { data: todoToDelete },
      } = await todoOrcha.create(auth.body.data.token, {
        content: 'new content',
      });
      const {
        body: { data: todoToKeep },
      } = await todoOrcha.create(auth.body.data.token, {
        content: 'new content',
      });
      await todoOrcha.tag(auth.body.data.token, {
        todoId: todoToDelete.id,
        tagName: 'shouldDelete',
      });
      await todoOrcha.tag(auth.body.data.token, { todoId: todoToKeep.id, tagName: 'shouldKeep' });
      await todoOrcha.tag(auth.body.data.token, { todoId: todoToKeep.id, tagName: 'shouldKeep' });
      const { body } = await todoOrcha.delete(auth.body.data.token, {
        todoId: todoToDelete.id,
      });
      expect(body.data.deletedId).toBe(todoToDelete.id);
      expect(await todoRepo.findOne(todoToDelete.id, {})).toBeFalsy();
      expect(await tagRepo.findByNameAndUser('shouldDelete', userId, {})).toBeFalsy();
      expect(await tagRepo.findByNameAndUser('shouldKeep', userId, {})).toBeTruthy();
    });
  });
  describe('tag', () => {
    it('should tag a todo', async () => {
      const {
        body: { data: todo },
      } = await todoOrcha.create(auth.body.data.token, {
        content: 'new content',
      });
      const {
        body: { data: taggedTodo },
      } = await todoOrcha.tag(auth.body.data.token, {
        todoId: todo.id,
        tagName: 'tag1',
      });
      expect(taggedTodo.taggedTodos[0].tag.name).toBe('tag1');
    });
    // it('should reuse a tag', async () => {
    //   const { body:{data: todo1} } = await todoOrcha.create( auth.body.data.token, { content: 'new content' });
    //   const { body:{data: todo2} } = await todoOrcha.create( auth.body.data.token, { content: 'new content' });
    //   await todoOrcha.tag( auth.body.data.token, { todoId: todo1.id, tagName: 'tag1' });
    //   await todoOrcha.tag( auth.body.data.token, { todoId: todo2.id, tagName: 'tag1' });
    //   const { body:{data: todos} } = await todoOrcha.read( auth.body.data.token);
    //   expect(todos[0].taggedTodos[0].tag.id).toBe(todos[1].taggedTodos[0].tag.id);
    // });
    it('should create separate tag entities if same name but different user', async () => {
      const {
        body: { data: otherUser },
      } = await userOrcha.signUp('', {
        email: 'other@user.com',
        password: 'PAsWd12!',
      });
      const {
        body: { data: myTodo },
      } = await todoOrcha.create(auth.body.data.token, {
        content: 'new content',
      });
      const {
        body: { data: otherTodo },
      } = await todoOrcha.create(otherUser.token, {
        content: 'new content',
      });
      const {
        body: { data: myTaggedTodo },
      } = await todoOrcha.tag(auth.body.data.token, {
        todoId: myTodo.id,
        tagName: 'sameTagName',
      });
      const {
        body: { data: otherTaggedTodo },
      } = await todoOrcha.tag(otherUser.token, {
        todoId: otherTodo.id,
        tagName: 'sameTagName',
      });
      expect(myTaggedTodo.taggedTodos[0].tag.id).not.toBe(otherTaggedTodo.taggedTodos[0].tag.id);
    });
  });
  describe('untag', () => {
    it('should untag and delete lonely tag', async () => {
      const {
        body: { data: todo },
      } = await todoOrcha.create(auth.body.data.token, {
        content: 'new content',
      });
      const {
        body: { data: taggedTodo },
      } = await todoOrcha.tag(auth.body.data.token, {
        todoId: todo.id,
        tagName: 'tag1',
      });
      const {
        body: { data: untaggedTodo },
      } = await todoOrcha.untag(auth.body.data.token, {
        taggedTodoId: taggedTodo.taggedTodos[0].id,
      });
      expect(untaggedTodo.taggedTodos.length).toBe(0);
      expect(await tagRepo.findOne(taggedTodo.taggedTodos[0].tag.id, {})).toBeFalsy();
    });
    it('should untag and keep non-lonely tags', async () => {
      const {
        body: { data: todo },
      } = await todoOrcha.create(auth.body.data.token, {
        content: 'new content',
      });
      const {
        body: { data: tagToDelete },
      } = await todoOrcha.tag(auth.body.data.token, {
        todoId: todo.id,
        tagName: 'tagToDelete',
      });
      await todoOrcha.tag(auth.body.data.token, {
        todoId: todo.id,
        tagName: 'tagToKeep',
      });
      await todoOrcha.untag(auth.body.data.token, {
        taggedTodoId: tagToDelete.taggedTodos[0].id,
      });
      expect(await tagRepo.findByNameAndUser('tagToDelete', userId, {})).toBeFalsy();
      expect(await tagRepo.findByNameAndUser('tagToKeep', userId, {})).toBeTruthy();
    });
  });
  describe('paginate', () => {
    it('paginate', async () => {
      await todoOrcha.create(auth.body.data.token, { content: 'content1' });
      await todoOrcha.create(auth.body.data.token, { content: 'content2' });
      await todoOrcha.create(auth.body.data.token, { content: 'content3' });
      const { body } = await todoOrcha.paginateAll(auth.body.data.token, { offset: 0, limit: 1 });
      expect(body.data.items.length).toBe(1);
      expect(body.data.extra).toBe('extra');
      const {
        body: { data: body2 },
      } = await todoOrcha.paginateAll(auth.body.data.token, { offset: 0, limit: 2 });
      expect(body2.items.length).toBe(2);
      const {
        body: { data: body3 },
      } = await todoOrcha.paginateAll(auth.body.data.token, { offset: 0, limit: 3 });
      expect(body3.items.length).toBe(3);
      const {
        body: { data: body4 },
      } = await todoOrcha.paginateAll(auth.body.data.token, { offset: 2, limit: 1 });
      expect(body4.items.length).toBe(1);
    });
  });
});
