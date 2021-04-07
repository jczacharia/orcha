import { Tag } from '@orcha-todo-example-app/shared/domain';
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { TaggedTodoEntity } from '../tagged-todo/tagged-todo.entity';
import { UserEntity } from '../user/user.entity';

@Entity()
export class TagEntity implements Required<Tag> {
  @PrimaryColumn('text')
  id!: string;

  @Column()
  name!: string;

  @Column()
  dateCreated!: Date;

  @Column()
  dateUpdated!: Date;

  @ManyToOne(() => UserEntity, (e) => e.tags)
  user!: UserEntity;

  @OneToMany(() => TaggedTodoEntity, (e) => e.tag, { cascade: true })
  taggedTodos!: TaggedTodoEntity[];
}
