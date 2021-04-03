import { IOperation } from '@orcha/common';
import { CreateTagDto, DeleteTagDto, UpdateTagDto } from './tag.dtos';
import { Tag } from './tag.model';

export interface ITagOrchestration {
  create: IOperation<Tag, CreateTagDto>;
  read: IOperation<Tag[]>;
  update: IOperation<Tag, UpdateTagDto>;
  delete: IOperation<{ deletedId: string }, DeleteTagDto>;
}
