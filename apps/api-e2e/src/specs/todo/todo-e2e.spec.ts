import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TagRepository, TodoRepository } from '@orcha-todo-example-app/server/core/domain';
import { ITodoOrchestration, IUserOrchestration, Todo } from '@orcha-todo-example-app/shared/domain';
import { createQuery } from '@orcha/common';
import { ITestOrchestration } from '@orcha/testing';
import { AppTestModule } from '../../core/app-test.module';
import { DatabaseService } from '../../core/database.service';
import { createUserOrchestration } from '../user/user.orchestration';
import { createTodoOrchestration } from './todo.orchestration';

describe('Todo Orchestration Integration Tests', () => {
  let app: INestApplication;
  let db: DatabaseService;

  let userOrcha: ITestOrchestration<IUserOrchestration>;
  let todoOrcha: ITestOrchestration<ITodoOrchestration>;

  let todoRepo: TodoRepository;
  let tagRepo: TagRepository;

  const credentials = { id: 'email@email.com', password: 'GoodPwd341' };
  let auth: { body: { token: string }; statusCode: HttpStatus };

  const todoQuery = createQuery<Todo>()({
    id: true,
    content: true,
    dateCreated: true,
    dateUpdated: true,
    done: true,
    user: {
      id: true,
    },
    todoTags: {
      id: true,
      tag: {
        id: true,
        name: true,
      },
    },
  });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppTestModule],
      providers: [DatabaseService],
    }).compile();

    app = moduleRef.createNestApplication();
    db = moduleRef.get(DatabaseService);

    userOrcha = createUserOrchestration(app);
    todoOrcha = createTodoOrchestration(app);

    todoRepo = moduleRef.get(TodoRepository);
    tagRepo = moduleRef.get(TagRepository);

    await app.init();
  });

  beforeEach(async () => {
    await db.clearDb();
    auth = await userOrcha.signUp({ token: true }, '', credentials);
  });

  afterAll(async () => await app.close());

  describe('create', () => {
    it('should create todo', async () => {
      const { body: todo } = await todoOrcha.create(todoQuery, auth.body.token, { content: 'content' });
      expect(todo.user.id).toBe(credentials.id);
      expect(todo.content).toBe('content');
      expect(todo.done).toBe(false);
    });
  });
  describe('read', () => {
    it('should get no todos at system init', async () => {
      const { body: todos } = await todoOrcha.read(todoQuery, auth.body.token);
      expect(todos.length).toBe(0);
    });
    it('should get my todo items', async () => {
      await todoOrcha.create(todoQuery, auth.body.token, { content: 'content' });
      const { body: todos } = await todoOrcha.read(todoQuery, auth.body.token);
      expect(todos.length).toBe(1);
      expect(todos[0].content).toBe('content');
      expect(todos[0].user.id).toBe(credentials.id);
    });
  });
  describe('update', () => {
    it('should not update if owned by another user', async () => {
      const { body: otherUser } = await userOrcha.signUp({ token: true }, '', {
        id: 'other@user.com',
        password: 'PAsWd12!',
      });
      const { body: otherTodo } = await todoOrcha.create(todoQuery, otherUser.token, { content: 'content' });
      const { error } = await todoOrcha.update(todoQuery, auth.body.token, {
        todoId: otherTodo.id,
        content: 'new content',
      });
      expect(error).toBe('You cannot update a todo item for another user.');
    });
    it('should update todo', async () => {
      const { body: todo } = await todoOrcha.create(todoQuery, auth.body.token, { content: 'new content' });
      const { body: updatedTodo } = await todoOrcha.update(todoQuery, auth.body.token, { todoId: todo.id });
      expect(updatedTodo.content).toBe('new content');
      expect(updatedTodo.user.id).toBe(credentials.id);
    });
  });
  describe('delete', () => {
    it('should not delete if owned by another user', async () => {
      const { body: otherUser } = await userOrcha.signUp({ token: true }, '', {
        id: 'other@user.com',
        password: 'PAsWd12!',
      });
      const { body: otherTodo } = await todoOrcha.create(todoQuery, otherUser.token, { content: 'content' });
      const { error } = await todoOrcha.delete({ deletedId: true }, auth.body.token, {
        todoId: otherTodo.id,
      });
      expect(error).toBe('You cannot delete a todo item for another user.');
    });
    it('should delete todo', async () => {
      const { body: todo } = await todoOrcha.create(todoQuery, auth.body.token, { content: 'new content' });
      const { body: deletedTodo } = await todoOrcha.delete({ deletedId: true }, auth.body.token, {
        todoId: todo.id,
      });
      expect(deletedTodo.deletedId).toBe(todo.id);
      expect(await todoRepo.findOne(todo.id)).toBeFalsy();
    });
    it('should delete todo and all lonely tags', async () => {
      const { body: todo } = await todoOrcha.create(todoQuery, auth.body.token, { content: 'new content' });
      const { body: taggedTodo } = await todoOrcha.tag(todoQuery, auth.body.token, {
        todoId: todo.id,
        tagName: 'tag',
      });
      const { body: deletedTodo } = await todoOrcha.delete({ deletedId: true }, auth.body.token, {
        todoId: todo.id,
      });
      expect(deletedTodo.deletedId).toBe(todo.id);
      expect(await todoRepo.findOne(todo.id)).toBeFalsy();
      expect(await tagRepo.findOne(taggedTodo.todoTags[0].tag.id)).toBeFalsy();
    });
    it('should delete todo and keep non-lonely tags', async () => {
      const { body: todoToDelete } = await todoOrcha.create(todoQuery, auth.body.token, {
        content: 'new content',
      });
      const { body: todoToKeep } = await todoOrcha.create(todoQuery, auth.body.token, {
        content: 'new content',
      });
      await todoOrcha.tag(todoQuery, auth.body.token, { todoId: todoToDelete.id, tagName: 'shouldDelete' });
      await todoOrcha.tag(todoQuery, auth.body.token, { todoId: todoToKeep.id, tagName: 'shouldKeep' });
      await todoOrcha.tag(todoQuery, auth.body.token, { todoId: todoToKeep.id, tagName: 'shouldKeep' });
      const { body } = await todoOrcha.delete({ deletedId: true }, auth.body.token, {
        todoId: todoToDelete.id,
      });
      expect(body.deletedId).toBe(todoToDelete.id);
      expect(await todoRepo.findOne(todoToDelete.id)).toBeFalsy();
      expect(
        (await tagRepo.query({ id: true }, { where: { name: 'shouldDelete', user: credentials.id } })).length
      ).toBe(0);
      expect(
        (await tagRepo.query({ id: true }, { where: { name: 'shouldKeep', user: credentials.id } })).length
      ).toBe(1);
    });
  });
  describe('tag', () => {
    it('should tag a todo', async () => {
      const { body: todo } = await todoOrcha.create(todoQuery, auth.body.token, { content: 'new content' });
      const { body: taggedTodo } = await todoOrcha.tag(todoQuery, auth.body.token, {
        todoId: todo.id,
        tagName: 'tag1',
      });
      expect(taggedTodo.todoTags[0].tag.name).toBe('tag1');
    });
    it('should reuse a tag', async () => {
      const { body: todo1 } = await todoOrcha.create(todoQuery, auth.body.token, { content: 'new content' });
      const { body: todo2 } = await todoOrcha.create(todoQuery, auth.body.token, { content: 'new content' });
      await todoOrcha.tag(todoQuery, auth.body.token, { todoId: todo1.id, tagName: 'tag1' });
      await todoOrcha.tag(todoQuery, auth.body.token, { todoId: todo2.id, tagName: 'tag1' });
      const { body: todos } = await todoOrcha.read(todoQuery, auth.body.token);
      expect(todos[0].todoTags[0].tag.id).toBe(todos[1].todoTags[0].tag.id);
    });
    it('should create separate tag entities if same name but different user', async () => {
      const { body: otherUser } = await userOrcha.signUp({ token: true }, '', {
        id: 'other@user.com',
        password: 'PAsWd12!',
      });
      const { body: myTodo } = await todoOrcha.create(todoQuery, auth.body.token, { content: 'new content' });
      const { body: otherTodo } = await todoOrcha.create(todoQuery, otherUser.token, {
        content: 'new content',
      });
      const { body: myTaggedTodo } = await todoOrcha.tag(todoQuery, auth.body.token, {
        todoId: myTodo.id,
        tagName: 'sameTagName',
      });
      const { body: otherTaggedTodo } = await todoOrcha.tag(todoQuery, otherUser.token, {
        todoId: otherTodo.id,
        tagName: 'sameTagName',
      });
      expect(myTaggedTodo.todoTags[0].tag.id).not.toBe(otherTaggedTodo.todoTags[0].tag.id);
    });
  });
  describe('untag', () => {
    it('should untag and delete lonely tag', async () => {
      const { body: todo } = await todoOrcha.create(todoQuery, auth.body.token, { content: 'new content' });
      const { body: taggedTodo } = await todoOrcha.tag(todoQuery, auth.body.token, {
        todoId: todo.id,
        tagName: 'tag1',
      });
      const { body: untaggedTodo } = await todoOrcha.untag(todoQuery, auth.body.token, {
        todoTagId: taggedTodo.todoTags[0].id,
      });
      expect(untaggedTodo.todoTags.length).toBe(0);
      expect(await tagRepo.findOne(taggedTodo.todoTags[0].tag.id)).toBeFalsy();
    });
    it('should untag and keep non-lonely tags', async () => {
      const { body: todo } = await todoOrcha.create(todoQuery, auth.body.token, { content: 'new content' });
      const { body: tagToDelete } = await todoOrcha.tag(todoQuery, auth.body.token, {
        todoId: todo.id,
        tagName: 'tagToDelete',
      });
      await todoOrcha.tag(todoQuery, auth.body.token, {
        todoId: todo.id,
        tagName: 'tagToKeep',
      });
      await todoOrcha.untag(todoQuery, auth.body.token, {
        todoTagId: tagToDelete.todoTags[0].id,
      });
      expect(
        (await tagRepo.query({ id: true }, { where: { name: 'tagToDelete', user: credentials.id } })).length
      ).toBe(0);
      expect(
        (await tagRepo.query({ id: true }, { where: { name: 'tagToKeep', user: credentials.id } })).length
      ).toBe(1);
    });
  });
});
