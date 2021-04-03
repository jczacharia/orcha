import { createLogic } from '@orcha/common';
import { Tag } from './tag.model';

/**
 * Finds if a tag has a name conflict.
 */
export const findConflictingTagName = createLogic<Tag[], { name: true }>()((tags, name: string) =>
  tags.some((tag) => tag.name === name)
);
