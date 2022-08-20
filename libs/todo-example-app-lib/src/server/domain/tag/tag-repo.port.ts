import { IExactQuery, IParser, IQuery, OrchaBaseRepositoryPort } from '@orcha/common';
import { Tag } from '../../../shared/domain/tag';

export abstract class TagRepoPort extends OrchaBaseRepositoryPort<Tag> {
  abstract findByNameAndUser<Q extends IQuery<Tag>>(
    tagName: string,
    userId: string,
    query: IExactQuery<Tag, Q>
  ): Promise<IParser<Tag, Q> | null>;

  abstract findByUser<Q extends IQuery<Tag>>(
    userId: string,
    query: IExactQuery<Tag, Q>
  ): Promise<IParser<Tag[], Q>>;
}
