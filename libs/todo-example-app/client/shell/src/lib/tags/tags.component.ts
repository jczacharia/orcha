import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormControl } from '@ngneat/reactive-forms';
import { AppFacade, TagStoreModel } from '@orcha-todo-example-app/client/shared/data-access';
import { RxJSBaseClass } from '@orcha-todo-example-app/client/shared/util';

@Component({
  selector: 'orcha-todo-example-app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsComponent extends RxJSBaseClass implements OnInit {
  readonly tag = new FormControl('', (ac) => Validators.required(ac));

  tags: TagStoreModel[] = [];
  loaded = false;

  constructor(private readonly app: AppFacade, private readonly _change: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    this.app.tag.selectors.tags$.pipe().subscribe(({ tags, loaded }) => {
      this.tags = tags.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
      this.loaded = loaded;
      this._change.markForCheck();
    });
  }

  // create() {
  //   this.app.tag.dispatchers.create(this.tag.value);
  // }

  // delete(tag: TagStoreModel) {
  //   this.app.tag.dispatchers.delete(tag);
  // }
}
