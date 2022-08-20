import { IPaginate } from '@orcha/common';
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
    private taggedTodoRepo: TaggedTodoRepoPort
  ) {}

  async getMine(token: string) {
    const user = await this.user.verifyUserToken(token, { id: true });
    return this.todoRepo.getByUser(user.id, TodoQueryModel);
  }

  /**
   * Creates a new todo entity.
   * @param token User's auth token.
   * @param dto Specs for creating the new todo entity.
   */
  async create(token: string, dto: CreateTodoDto) {
    const user = await this.user.verifyUserToken(token, { id: true });
    const newTodo = await this.todoRepo.createOne(
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        id: undefined!, // Auto-increment
        content: dto.content,
        dateCreated: new Date(),
        dateUpdated: new Date(),
        done: false,
        taggedTodos: [],
        user: user.id,
      },
      { id: true }
    );
    return this.todoRepo.findOneOrFail(newTodo.id, TodoQueryModel);
  }

  /**
   * Update a todo entity.
   * @param token User auth token.
   * @param dto Id of todo to update.
   */
  async update(token: string, dto: UpdateTodoDto) {
    const user = await this.user.verifyUserToken(token, { id: true });
    const todo = await this.todoRepo.findOneOrFail(dto.todoId, {
      id: true,
      dateUpdated: true,
      content: true,
      done: true,
      user: { id: true },
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
    const user = await this.user.verifyUserToken(token, { id: true });
    const todo = await this.todoRepo.findOneOrFail(dto.todoId, {
      user: { id: true },
    });

    if (user.id !== todo.user.id) {
      throw new Error('You cannot delete a todo item for another user.');
    }

    await this.todoRepo.deleteTodoAndLonelyTags(dto.todoId);
    return { deletedId: dto.todoId };
  }

  /**
   * Links a Tag to a Todo. If the Tag name does not exist (for a user) then create a new Tag.
   * @param token User's auth token.
   * @param dto Link the todo Id and the Tag name.
   */
  async tag(token: string, dto: TagDto) {
    const user = await this.user.verifyUserToken(token, { id: true });
    const todo = await this.todoRepo.findOneOrFail(dto.todoId, {
      id: true,
      user: { id: true },
    });

    if (todo.user.id !== user.id) {
      throw new Error('You cannot add a tag to someone elses todo.');
    }

    const tagAlreadyExists = await this.tagRepo.findByNameAndUser(dto.tagName, user.id, { id: true });

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
    const user = await this.user.verifyUserToken(token, { id: true });
    const taggedTodo = await this.taggedTodoRepo.findOneOrFail(dto.taggedTodoId, {
      id: true,
      todo: { id: true },
      tag: { id: true },
    });

    const todo = await this.todoRepo.findOneOrFail(taggedTodo.todo.id, { user: { id: true } });
    if (todo.user.id !== user.id) {
      throw new Error('You cannot untag someone elses todo.');
    }

    await this.taggedTodoRepo.deleteTaggedTodoAndLonelyTags(taggedTodo.id);

    return this.todoRepo.findOneOrFail(taggedTodo.todo.id, TodoQueryModel);
  }

  async paginateAll(token: string, paginate: IPaginate) {
    await this.user.verifyUserToken(token, {});
    return this.todoRepo.paginateAll(paginate, TodoQueryModel);
  }
}
