import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { AppFacade } from '../../domain/app.facade';
import { RxJSBaseClass } from '../../util/rxjs-base-class';

@Component({
  selector: 'orcha-todo-example-app-app-shell',
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent extends RxJSBaseClass implements OnInit {
  activeRoute = '';

  constructor(
    private readonly app: AppFacade,
    private readonly router: Router,
    private readonly change: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.activeRoute = this.router.url;
    this.change.markForCheck();

    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((res) => {
      if (res instanceof NavigationEnd) {
        this.activeRoute = res.urlAfterRedirects;
        this.change.markForCheck();
      }
    });
  }

  logout() {
    this.app.user.dispatchers.logout();
  }

  todos() {
    this.router.navigate(['todos']);
  }

  todosPaginate() {
    this.router.navigate(['todos-paginate']);
  }

  tags() {
    this.router.navigate(['tags']);
  }

  profile() {
    this.router.navigate(['profile']);
  }

  query() {
    this.router.navigate(['query']);
  }
}
