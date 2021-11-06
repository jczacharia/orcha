import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  TaggedTodoRepository,
  TagRepository,
  TodoRepository,
} from '@orcha-todo-example-app/server/core/domain';
import {
  CreateTodoDto,
  DeleteTodoDto,
  TagDto,
  Todo,
  UnTagDto,
  UpdateTodoDto,
} from '@orcha-todo-example-app/shared/domain';
import { IQuery, parseQuery } from '@orcha/common';
import { Socket } from 'socket.io';
import * as uuid from 'uuid';
import { DbTransactionCreator } from '../transaction-creator/transaction-creator.service';
import { UserService } from '../user';

@Injectable()
export class TodoService {
  readonly subscriptions = {
    /**
     * Gets all of a user's todo entities.
     * @param query Orcha query of todos.
     * @param token User's auth token.
     */
    read: async (socket: Socket, query: IQuery<Todo[]>, token: string, channel: string) => {
      const user = await this._user.verifyUserToken(token);
      return this._todoRepo.subscriptions.querySubscription(socket, channel, query, {
        where: { user: user.id },
      });
    },

    onDisconnect: (socket: Socket) => {
      return this._todoRepo.subscriptions.onDisconnect(socket);
    },
  };

  constructor(
    private readonly _todoRepo: TodoRepository,
    private readonly _user: UserService,
    private readonly _tagRepo: TagRepository,
    private readonly _taggedTodoRepo: TaggedTodoRepository,
    private readonly _transaction: DbTransactionCreator
  ) {}

  /**
   * Creates a new todo entity.
   * @param query Orcha query of Todo.
   * @param token User's auth token.
   * @param dto Specs for creating the new todo entity.
   */
  async create(query: IQuery<Todo>, token: string, dto: CreateTodoDto) {
    const user = await this._user.verifyUserToken(token);
    return this._todoRepo.upsert(
      {
        id: uuid.v4(),
        content: dto.content,
        dateCreated: new Date(),
        dateUpdated: new Date(),
        done: false,
        user: user.id,
        taggedTodos: [],
      },
      query
    );
  }

  /**
   * Update a todo entity.
   * @param query Orcha query of todo.
   * @param token User auth token.
   * @param dto Id of todo to update.
   */
  async update(query: IQuery<Todo>, token: string, dto: UpdateTodoDto) {
    const user = await this._user.verifyUserToken(token);
    const todo = await this._todoRepo.findOneOrFail(dto.todoId, {
      user: { id: true },
      done: true,
      content: true,
    });

    if (user.id !== todo.user.id) {
      throw new HttpException('You cannot update a todo item for another user.', HttpStatus.UNAUTHORIZED);
    }

    return this._todoRepo.update(
      dto.todoId,
      { content: dto.content, done: dto.done, dateUpdated: new Date() },
      query
    );
  }

  /**
   * Deletes a todo entity, all of it's Tag links and any tags which were matched to only this Todo.
   * @param query Orcha query of the deleted Id of the Todo.
   * @param token User's auth token.
   * @param dto Id of todo to delete.
   */
  async delete(query: IQuery<{ deletedId: string }>, token: string, dto: DeleteTodoDto) {
    const user = await this._user.verifyUserToken(token);
    const todo = await this._todoRepo.findOneOrFail(dto.todoId, {
      user: { id: true },
      taggedTodos: { id: true },
    });

    if (user.id !== todo.user.id) {
      throw new HttpException('You cannot delete a todo item for another user.', HttpStatus.UNAUTHORIZED);
    }

    await this._transaction.run(async () => {
      await this._taggedTodoRepo.deleteMany(todo.taggedTodos.map((tt) => tt.id));
      await this._todoRepo.delete(dto.todoId);
      await this._deleteLonelyTags(user.id);
    });

    return parseQuery(query, { deletedId: dto.todoId });
  }

  /**
   * Links a Tag to a Todo. If the Tag name does not exist (for a user) then create a new Tag.
   * @param query Orcha query of Todo.
   * @param token User's auth token.
   * @param dto Link the todo Id and the Tag name.
   */
  async tag(query: IQuery<Todo>, token: string, dto: TagDto) {
    const user = await this._user.verifyUserToken(token);

    const todo = await this._todoRepo.findOneOrFail(dto.todoId, { id: true, user: { id: true } });
    if (todo.user.id !== user.id) {
      throw new HttpException('You cannot add a tag to someone elses todo.', HttpStatus.UNAUTHORIZED);
    }

    const tags = await this._tagRepo.query(
      { id: true, name: true, user: { id: true } },
      { where: { name: dto.tagName, user: user.id } }
    );

    const tagAlreadyExists = tags[0];
    if (!tagAlreadyExists) {
      await this._tagRepo.upsert({
        id: uuid.v4(),
        dateCreated: new Date(),
        dateUpdated: new Date(),
        name: dto.tagName,
        user: user.id,
        taggedTodos: [
          {
            id: uuid.v4(),
            dateLinked: new Date(),
            todo: todo.id,
          },
        ],
      });
      return this._todoRepo.findOneOrFail(todo.id, query);
    }

    const tts = await this._taggedTodoRepo.query({}, { where: { tag: tagAlreadyExists.id, todo: todo.id } });
    if (!tts[0]) {
      await this._taggedTodoRepo.upsert({
        id: uuid.v4(),
        dateLinked: new Date(),
        todo: todo.id,
        tag: tagAlreadyExists.id,
      });
    }
    return this._todoRepo.findOneOrFail(todo.id, query);
  }

  /**
   * Unlinks a Tag to a Todo. If the Tag name does not exist (for a user) then create a new Tag.
   * @param query Orcha query of Todo.
   * @param token User's auth token.
   * @param dto Link the todo Id and the Tag name.
   */
  async untag(query: IQuery<Todo>, token: string, dto: UnTagDto) {
    const user = await this._user.verifyUserToken(token);
    const taggedTodo = await this._taggedTodoRepo.findOneOrFail(dto.taggedTodoId, {
      todo: { id: true },
      tag: { id: true },
    });

    const todo = await this._todoRepo.findOneOrFail(taggedTodo.todo.id, { user: { id: true } });
    if (todo.user.id !== user.id) {
      throw new HttpException('You cannot untag someone elses todo.', HttpStatus.UNAUTHORIZED);
    }

    await this._transaction.run(async () => {
      await this._taggedTodoRepo.delete(dto.taggedTodoId);
      await this._deleteLonelyTags(user.id);
    });

    return this._todoRepo.findOneOrFail(taggedTodo.todo.id, query);
  }

  /**
   * Deletes all Tags that are not linked to a todo by user.
   * @param userId Id of User to delete lonely Tags
   */
  private async _deleteLonelyTags(userId: string) {
    const tags = await this._tagRepo.query({ id: true, taggedTodos: {} }, { where: { user: userId } });
    const lonelyTags = tags.filter((tag) => tag.taggedTodos.length === 0);
    await this._tagRepo.deleteMany(lonelyTags.map((t) => t.id));
  }
}
