import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IPaginate, IQuery, parseQuery } from '@orcha/common';
import { TaggedTodoRepository, TagRepository, TodoRepository } from '@orcha/todo/server/domain';
import {
  CreateTodoDto,
  DeleteTodoDto,
  TagDto,
  Todo,
  TodoListenOneDto,
  TodoUpdateAndListenOneDto,
  UnTagDto,
  UpdateTodoDto,
} from '@orcha/todo/shared/domain';
import { nanoid } from 'nanoid';
import { Socket } from 'socket.io';
import { UserService } from '../user/user.service';

@Injectable()
export class TodoService {
  readonly subscriptions = {
    listen: async (socket: Socket, query: IQuery<Todo[]>, token: string, channel: string) => {
      const userId = await this._user.verifyUserToken(token);
      return this._todoRepo.orcha.subscriptions.querySubscription(socket, channel, query, {
        user: { id: userId },
      });
    },
    listenOne: async (
      socket: Socket,
      query: IQuery<Todo>,
      token: string,
      dto: TodoListenOneDto,
      channel: string
    ) => {
      const userId = await this._user.verifyUserToken(token);
      const todo = await this._todoRepo.repo.findOneOrFail({ id: dto.todoId }, { populate: ['user'] });
      if (todo.user.id !== userId) {
        throw new Error('This todo is not yours.');
      }
      return this._todoRepo.orcha.subscriptions.querySubscription(socket, channel, query, { id: dto.todoId });
    },
    updateAndListenOne: async (
      socket: Socket,
      query: IQuery<Todo>,
      token: string,
      dto: TodoUpdateAndListenOneDto,
      channel: string
    ) => {
      const userId = await this._user.verifyUserToken(token);
      const todo = await this._todoRepo.repo.findOneOrFail({ id: dto.todoId }, { populate: ['user'] });
      if (todo.user.id !== userId) {
        throw new Error('This todo is not yours.');
      }
      todo.content = dto.content;
      await this._todoRepo.repo.persistAndFlush(todo);
      this._todoRepo.gatewaysStorage.trigger(todo.id);
      return this._todoRepo.orcha.subscriptions.querySubscription(socket, channel, query, { id: dto.todoId });
    },
    onDisconnect: (socket: Socket) => {
      return this._todoRepo.orcha.subscriptions.onDisconnect(socket);
    },
  };

  constructor(
    private readonly _todoRepo: TodoRepository,
    private readonly _user: UserService,
    private readonly _tagRepo: TagRepository,
    private readonly _taggedTodoRepo: TaggedTodoRepository
  ) {}

  /**
   * Creates a new todo entity.
   * @param query Orcha query of Todo.
   * @param token User's auth token.
   * @param dto Specs for creating the new todo entity.
   */
  async create(query: IQuery<Todo>, token: string, dto: CreateTodoDto) {
    const userId = await this._user.verifyUserToken(token);
    const newTodo = this._todoRepo.repo.create({
      content: dto.content,
      dateCreated: new Date(),
      dateUpdated: new Date(),
      done: false,
      user: userId,
    });
    await this._todoRepo.repo.persistAndFlush(newTodo);
    this._todoRepo.gatewaysStorage.trigger(newTodo.id);
    return this._todoRepo.orcha.findOneOrFail(newTodo.id, query);
  }

  /**
   * Update a todo entity.
   * @param query Orcha query of todo.
   * @param token User auth token.
   * @param dto Id of todo to update.
   */
  async update(query: IQuery<Todo>, token: string, dto: UpdateTodoDto) {
    const userId = await this._user.verifyUserToken(token);
    const todo = await this._todoRepo.repo.findOneOrFail({ id: dto.todoId }, { populate: ['user'] });

    if (userId !== todo.user.id) {
      throw new HttpException('You cannot update a todo item for another user.', HttpStatus.UNAUTHORIZED);
    }

    dto.content !== undefined && (todo.content = dto.content);
    dto.done !== undefined && (todo.done = dto.done);
    todo.dateUpdated = new Date();
    await this._todoRepo.repo.persistAndFlush(todo);
    this._todoRepo.gatewaysStorage.trigger(todo.id);

    return this._todoRepo.orcha.findOneOrFail(dto.todoId, query);
  }

  /**
   * Deletes a todo entity, all of it's Tag links and any tags which were matched to only this Todo.
   * @param query Orcha query of the deleted Id of the Todo.
   * @param token User's auth token.
   * @param dto Id of todo to delete.
   */
  async delete(query: IQuery<{ deletedId: string }>, token: string, dto: DeleteTodoDto) {
    const userId = await this._user.verifyUserToken(token);
    const todo = await this._todoRepo.repo.findOneOrFail(
      { id: dto.todoId },
      { populate: ['user', 'taggedTodos'] }
    );

    if (userId !== todo.user.id) {
      throw new HttpException('You cannot delete a todo item for another user.', HttpStatus.UNAUTHORIZED);
    }

    todo.taggedTodos.removeAll();
    this._todoRepo.repo.remove(todo);
    await this._deleteLonelyTags(userId);
    await this._todoRepo.repo.flush();
    this._todoRepo.gatewaysStorage.trigger(dto.todoId);

    return parseQuery(query, { deletedId: dto.todoId });
  }

  /**
   * Links a Tag to a Todo. If the Tag name does not exist (for a user) then create a new Tag.
   * @param query Orcha query of Todo.
   * @param token User's auth token.
   * @param dto Link the todo Id and the Tag name.
   */
  async tag(query: IQuery<Todo>, token: string, dto: TagDto) {
    const userId = await this._user.verifyUserToken(token);

    const todo = await this._todoRepo.repo.findOneOrFail(dto.todoId, { populate: ['user'] });
    if (todo.user.id !== userId) {
      throw new HttpException('You cannot add a tag to someone elses todo.', HttpStatus.UNAUTHORIZED);
    }

    const tags = await this._tagRepo.repo.find(
      { name: dto.tagName, user: { id: userId } },
      { populate: ['user'] }
    );

    const tagAlreadyExists = tags[0];
    if (!tagAlreadyExists) {
      const newTag = this._tagRepo.repo.create({
        id: nanoid(),
        dateCreated: new Date(),
        dateUpdated: new Date(),
        name: dto.tagName,
        user: userId,
        taggedTodos: [
          {
            id: nanoid(),
            dateLinked: new Date(),
            todo: todo.id,
          },
        ],
      });
      await this._tagRepo.repo.persistAndFlush(newTag);
      this._tagRepo.gatewaysStorage.trigger(newTag.id);
      return this._todoRepo.orcha.findOneOrFail(todo.id, query);
    }

    const tts = await this._taggedTodoRepo.repo.find({
      tag: { id: tagAlreadyExists.id },
      todo: { id: todo.id },
    });
    if (!tts[0]) {
      const newTag = this._taggedTodoRepo.repo.create({
        id: nanoid(),
        dateLinked: new Date(),
        todo: todo.id,
        tag: tagAlreadyExists.id,
      });
      await this._tagRepo.repo.persistAndFlush(newTag);
      this._tagRepo.gatewaysStorage.trigger(newTag.id);
    }
    return this._todoRepo.orcha.findOneOrFail(todo.id, query);
  }

  /**
   * Unlinks a Tag to a Todo. If the Tag name does not exist (for a user) then create a new Tag.
   * @param query Orcha query of Todo.
   * @param token User's auth token.
   * @param dto Link the todo Id and the Tag name.
   */
  async untag(query: IQuery<Todo>, token: string, dto: UnTagDto) {
    const userId = await this._user.verifyUserToken(token);
    const taggedTodo = await this._taggedTodoRepo.repo.findOneOrFail(dto.taggedTodoId, {
      populate: ['tag', 'todo'],
    });

    const todo = await this._todoRepo.repo.findOneOrFail({ id: taggedTodo.todo.id }, { populate: ['user'] });
    if (todo.user.id !== userId) {
      throw new HttpException('You cannot untag someone elses todo.', HttpStatus.UNAUTHORIZED);
    }

    this._taggedTodoRepo.repo.remove(taggedTodo);
    await this._deleteLonelyTags(userId);
    await this._todoRepo.repo.flush();
    this._todoRepo.gatewaysStorage.trigger(todo.id);

    return this._todoRepo.orcha.findOneOrFail(taggedTodo.todo.id, query);
  }

  /**
   * Deletes all Tags that are not linked to a todo by user.
   * @param userId Id of User to delete lonely Tags
   */
  private async _deleteLonelyTags(userId: string) {
    const tags = await this._tagRepo.repo.find(
      { user: { id: userId } },
      { populate: ['user', 'taggedTodos'] }
    );
    const lonelyTags = tags.filter((tag) => tag.taggedTodos.length === 0);
    this._tagRepo.repo.remove(lonelyTags);
    this._tagRepo.gatewaysStorage.trigger(lonelyTags.map((t) => t.id));
  }

  async paginate(query: IQuery<Todo> & IPaginate, token: string) {
    await this._user.verifyUserToken(token);
    return this._todoRepo.orcha.paginate(query);
  }
}
