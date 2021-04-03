import { createQuery } from '@orcha/common';
import { Tag } from './tag.model';

export const TagQueryModel = createQuery<Tag>()({
  id: true,
  name: true,
  dateCreated: true,
  dateUpdated: true,
  user: {
    id: true,
  },
  todoTags: {
    id: true,
    todo: {
      id: true,
    },
  },
});

export const DeleteTagQueryModel = createQuery<{ deletedId: string }>()({ deletedId: true });
