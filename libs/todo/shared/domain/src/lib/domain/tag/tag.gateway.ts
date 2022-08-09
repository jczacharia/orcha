import { ISubscription } from '@orcha/common';
import { Tag } from './tag.model';

export interface ITagGateway {
  listen: ISubscription<Tag>;
}
