import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormControl } from '@ngneat/reactive-forms';
import { AppFacade, TagStoreModel, TodoStoreModel } from '@orcha-todo-example-app/client/shared/data-access';
import { RxJSBaseClass } from '@orcha-todo-example-app/client/shared/util';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'orcha-todo-example-app-todos',
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodosComponent extends RxJSBaseClass implements OnInit {
  readonly todo = new FormControl('', (ac) => Validators.required(ac));

  todos: TodoStoreModel[] = [];
  tags: TagStoreModel[] = [];
  loaded = false;

  constructor(private readonly app: AppFacade, private readonly _change: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    this.app.todo.selectors.todos$.pipe(takeUntil(this.destroy$)).subscribe(({ todos, loaded }) => {
      this.todos = todos.sort(
        (a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
      );
      this.loaded = loaded;
      this._change.markForCheck();
    });

    this.app.tag.selectors.tags$.pipe(takeUntil(this.destroy$)).subscribe(({ tags, loaded }) => {
      this.tags = tags.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
      this.loaded = loaded;
      this._change.markForCheck();
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
}
