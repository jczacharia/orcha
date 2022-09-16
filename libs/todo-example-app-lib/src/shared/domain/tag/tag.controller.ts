import { IOperationSimple } from '@orcha/common';
import { Tag } from './tag.model';
import { TagQueryModel } from './tag.queries';

export const TAG_CONTROLLER_NAME = 'tag';

export interface ITagController {
  getMine: IOperationSimple<Tag[], typeof TagQueryModel>;
}
