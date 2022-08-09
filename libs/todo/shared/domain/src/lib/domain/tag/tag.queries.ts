import { createQuery } from '@orcha/common';
import { Tag } from './tag.model';

export const TagQueryModel = createQuery<Tag[]>()({
  id: true,
  name: true,
});
