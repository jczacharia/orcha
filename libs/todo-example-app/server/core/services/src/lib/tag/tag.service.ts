import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TagRepository } from '@orcha-todo-example-app/server/core/domain';
import {
  CreateTagDto,
  DeleteTagDto,
  findConflictingTagName,
  Tag,
  UpdateTagDto,
} from '@orcha-todo-example-app/shared/domain';
import { IExactQuery, IQuery, parseOrchaQuery } from '@orcha/common';
import * as uuid from 'uuid';
import { UserService } from '../user';

@Injectable()
export class TagService {
  constructor(private readonly tagRepo: TagRepository, private readonly user: UserService) {}

  async create<Q extends IQuery<Tag>>(query: IExactQuery<Tag, Q>, token: string, dto: CreateTagDto) {
    const user = await this.user.verifyUserToken(token);

    const myTags = await this.tagRepo.query({ name: true }, { where: { user: user.id } });

    if (findConflictingTagName(myTags, dto.name)) {
      throw new HttpException('You already have a tag with the name.', HttpStatus.CONFLICT);
    }

    return this.tagRepo.upsert(
      {
        id: uuid.v4(),
        name: dto.name,
        dateCreated: new Date(),
        dateUpdated: new Date(),
        user: user.id,
        todoTags: [],
      },
      query
    );
  }

  async read(query: IQuery<Tag[]>, token: string) {
    const user = await this.user.verifyUserToken(token);
    return this.tagRepo.query(query, { where: { user: user.id } });
  }

  async update(query: IQuery<Tag>, token: string, dto: UpdateTagDto) {
    const user = await this.user.verifyUserToken(token);
    const tag = await this.tagRepo.findOneOrFail(dto.tagId, { user: { id: true } });

    if (user.id !== tag.user.id) {
      throw new HttpException('You cannot update a tag item for another user.', HttpStatus.UNAUTHORIZED);
    }

    return this.tagRepo.update(dto.tagId, { name: dto.name, dateUpdated: new Date() }, query);
  }

  async delete(query: IQuery<{ deletedId: string }>, token: string, dto: DeleteTagDto) {
    const user = await this.user.verifyUserToken(token);
    const tag = await this.tagRepo.findOneOrFail(dto.tagId, { user: { id: true } });

    if (user.id !== tag.user.id) {
      throw new HttpException('You cannot delete a tag item for another user.', HttpStatus.UNAUTHORIZED);
    }

    await this.tagRepo.delete(dto.tagId);
    return parseOrchaQuery(query, { deletedId: dto.tagId });
  }
}
