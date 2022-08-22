import { IOperation } from '@orcha/common';
import { Tag } from './tag.model';
import { TagQueryModel } from './tag.queries';

export const TAG_ORCHESTRATION_NAME = 'tag';

export interface ITagOrchestration {
  getMine: IOperation<Tag[], typeof TagQueryModel>;
}