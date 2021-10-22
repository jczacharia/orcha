import { IOperation } from '@orcha/common';
import { Tag } from './tag.model';

export interface ITagOrchestration {
  read: IOperation<Tag[]>;
}
