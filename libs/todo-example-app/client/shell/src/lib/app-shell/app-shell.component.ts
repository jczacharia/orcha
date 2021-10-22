import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AppFacade } from '@orcha-todo-example-app/client/shared/data-access';
import { RxJSBaseClass } from '@orcha-todo-example-app/client/shared/util';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'orcha-todo-example-app-app-shell',
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent extends RxJSBaseClass implements OnInit {
  activeRoute = '';

  constructor(
    private readonly _app: AppFacade,
    private readonly _router: Router,
    private readonly _change: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.activeRoute = this._router.url;
    this._change.markForCheck();

    this._router.events.pipe(takeUntil(this.destroy$)).subscribe((res) => {
      if (res instanceof NavigationEnd) {
        this.activeRoute = res.urlAfterRedirects;
        this._change.markForCheck();
      }
    });
  }

  logout() {
    this._app.user.dispatchers.logout();
  }

  todos() {
    this._router.navigate(['todos']);
  }

  todosPaginate() {
    this._router.navigate(['todos-paginate']);
  }

  tags() {
    this._router.navigate(['tags']);
  }

  profile() {
    this._router.navigate(['profile']);
  }
}
