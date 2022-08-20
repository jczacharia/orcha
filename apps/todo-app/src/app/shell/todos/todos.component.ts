import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs';
import { AppFacade } from '../../domain/app.facade';
import { TagStoreModel } from '../../domain/tag/tag.reducer';
import { TodoStoreModel } from '../../domain/todo/todo.reducer';
import { RxJSBaseClass } from '../../util/rxjs-base-class';

@Component({
  selector: 'orcha-todo-example-app-todos',
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodosComponent extends RxJSBaseClass implements OnInit {
  readonly todo = new UntypedFormControl('', (ac) => Validators.required(ac));

  todos: TodoStoreModel[] = [];
  tags: TagStoreModel[] = [];
  loaded = false;

  totalTodos = 0;

  tagFilter: 'all' | string = 'all';

  constructor(private app: AppFacade, private change: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    // this.app.user.selectors.state$.pipe(takeUntil(this.destroy$)).subscribe(({ view }) => {
    //   this.totalTodos = view.totalTodos;
    //   this.change.markForCheck();
    // });

    this.app.todo.selectors.todos$.pipe(takeUntil(this.destroy$)).subscribe(({ todos, loaded }) => {
      this.todos = todos.sort((a, b) =>
        a.dateCreated < b.dateCreated ? -1 : a.dateCreated > b.dateCreated ? 1 : 0
      );
      this.loaded = loaded;
      this.change.markForCheck();
    });

    this.app.tag.selectors.tags$.pipe(takeUntil(this.destroy$)).subscribe(({ tags, loaded }) => {
      this.tags = tags;
      this.loaded = loaded;
      if (!this.tags.some((t) => t.name === this.tagFilter)) {
        this.tagFilter = 'all';
      }
      this.change.markForCheck();
    });
  }

  create() {
    this.app.todo.dispatchers.create(this.todo.value);
  }

  delete(todo: TodoStoreModel) {
    this.app.todo.dispatchers.delete(todo);
  }

  toggle(todo: TodoStoreModel) {
    this.app.todo.dispatchers.update({ todoId: todo.id, done: !todo.done });
  }

  tag(todo: TodoStoreModel, tagName: string) {
    this.app.todo.dispatchers.tag(todo, tagName);
  }

  untag(taggedTodoId: string) {
    this.app.todo.dispatchers.untag(taggedTodoId);
  }

  tagFilterChange(tag: TagStoreModel) {
    this.tagFilter = tag.id;
  }

  todosFilter(todos: TodoStoreModel[]) {
    if (this.tagFilter === 'all') {
      return todos;
    }
    return todos.filter((todo) => todo.taggedTodos.some((t) => t.tag.id === this.tagFilter));
  }
}
