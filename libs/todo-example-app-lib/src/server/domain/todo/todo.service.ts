import { IPaginateQuery, OrchaDbTransactionalPort } from '@orcha/common';
import { nanoid } from 'nanoid';
import {
  CreateTodoDto,
  DeleteTodoDto,
  TagDto,
  TodoQueryModel,
  UnTagDto,
  UpdateTodoDto,
} from '../../../shared';
import { TagRepoPort } from '../tag/tag-repo.port';
import { TaggedTodoRepoPort } from '../tagged-todos/tagged-todos.port';
import { UserService } from '../user/user.service';
import { TodoRepoPort } from './todo-repo.port';

export class TodoService {
  constructor(
    private user: UserService,
    private todoRepo: TodoRepoPort,
    private tagRepo: TagRepoPort,
    private taggedTodoRepo: TaggedTodoRepoPort,
    private transaction: OrchaDbTransactionalPort
  ) {}

  async getMine(token: string) {
    const user = await this.user.verifyUserToken(token, {});
    return this.todoRepo.getByUser(user.id, TodoQueryModel);
  }

  /**
   * Creates a new todo entity.
   * @param token User's auth token.
   * @param dto Specs for creating the new todo entity.
   */
  async create(token: string, dto: CreateTodoDto) {
    const user = await this.user.verifyUserToken(token, {});
    const newTodo = await this.todoRepo.createOne(
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        id: undefined!, // Auto-increment
        content: dto.content,
        dateCreated: new Date(),
        dateUpdated: new Date(),
        done: false,
        user: user.id,
      },
      { user: {} }
    );
    return this.todoRepo.findOneOrFail(newTodo.id, TodoQueryModel);
  }

  /**
   * Update a todo entity.
   * @param token User auth token.
   * @param dto Id of todo to update.
   */
  async update(token: string, dto: UpdateTodoDto) {
    const user = await this.user.verifyUserToken(token, {});
    const todo = await this.todoRepo.findOneOrFail(dto.todoId, {
      dateUpdated: true,
      content: true,
      done: true,
      user: {},
    });

    if (user.id !== todo.user.id) {
      throw new Error('You cannot update a todo item for another user.');
    }

    return this.todoRepo.updateOne(
      todo.id,
      {
        content: dto.content,
        done: dto.done,
        dateUpdated: new Date(),
      },
      TodoQueryModel
    );
  }

  /**
   * Deletes a todo entity, all of it's Tag links and any tags which were matched to only this Todo.
   * @param token User's auth token.
   * @param dto Id of todo to delete.
   */
  async delete(token: string, dto: DeleteTodoDto) {
    const user = await this.user.verifyUserToken(token, {});
    const todo = await this.todoRepo.findOneOrFail(dto.todoId, {
      taggedTodos: {},
      user: {},
    });

    if (user.id !== todo.user.id) {
      throw new Error('You cannot delete a todo item for another user.');
    }

    const tags = await this.tagRepo.findAll({ taggedTodos: { todo: {} } });
    const lonelyTags = tags.filter((tag) => tag.taggedTodos.every((t) => t.todo.id === dto.todoId));

    await this.transaction.runInTransaction(async (db) => {
      await db.deleteMany(
        this.tagRepo,
        lonelyTags.map((s) => s.id)
      );
      await db.deleteOne(this.todoRepo, todo.id);
    });

    return { deletedId: dto.todoId };
  }

  /**
   * Links a Tag to a Todo. If the Tag name does not exist (for a user) then create a new Tag.
   * @param token User's auth token.
   * @param dto Link the todo Id and the Tag name.
   */
  async tag(token: string, dto: TagDto) {
    const user = await this.user.verifyUserToken(token, {});
    const todo = await this.todoRepo.findOneOrFail(dto.todoId, {
      user: {},
    });

    if (todo.user.id !== user.id) {
      throw new Error('You cannot add a tag to someone elses todo.');
    }

    const tagAlreadyExists = await this.tagRepo.findByNameAndUser(dto.tagName, user.id, {});

    if (!tagAlreadyExists) {
      await this.tagRepo.createOne(
        {
          id: nanoid(),
          dateCreated: new Date(),
          dateUpdated: new Date(),
          name: dto.tagName,
          user: user.id,
          taggedTodos: [
            {
              id: nanoid(),
              dateLinked: new Date(),
              todo: todo.id,
            },
          ],
        },
        {}
      );
      return this.todoRepo.findOneOrFail(todo.id, TodoQueryModel);
    }

    const taggedTodo = await this.taggedTodoRepo.findTaggedTodo(todo.id, tagAlreadyExists.id, {});
    if (!taggedTodo) {
      await this.taggedTodoRepo.createOne(
        {
          id: nanoid(),
          dateLinked: new Date(),
          todo: todo.id,
          tag: tagAlreadyExists.id,
        },
        {}
      );
    }
    return this.todoRepo.findOneOrFail(todo.id, TodoQueryModel);
  }

  /**
   * Unlinks a Tag to a Todo. If the Tag name does not exist (for a user) then create a new Tag.
   * @param token User's auth token.
   * @param dto Link the todo Id and the Tag name.
   */
  async untag(token: string, dto: UnTagDto) {
    const user = await this.user.verifyUserToken(token, {});
    const taggedTodo = await this.taggedTodoRepo.findOneOrFail(dto.taggedTodoId, {
      todo: {},
      tag: {},
    });

    const todo = await this.todoRepo.findOneOrFail(taggedTodo.todo.id, { user: {} });
    if (todo.user.id !== user.id) {
      throw new Error('You cannot untag someone elses todo.');
    }

    const tags = await this.tagRepo.findAll({ taggedTodos: {} });
    const lonelyTags = tags.filter(
      (tag) => tag.taggedTodos.length === 1 && tag.taggedTodos[0].id === dto.taggedTodoId
    );

    await this.tagRepo.deleteMany(lonelyTags.map((s) => s.id));

    return this.todoRepo.findOneOrFail(taggedTodo.todo.id, TodoQueryModel);
  }

  async paginateAll(token: string, paginate: IPaginateQuery) {
    await this.user.verifyUserToken(token, {});
    return this.todoRepo.paginateAll(paginate, TodoQueryModel);
  }
}
