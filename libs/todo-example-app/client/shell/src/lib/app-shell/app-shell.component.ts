import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AppFacade } from '@orcha-todo-example-app/client/shared/data-access';
import { StatefulComponent } from '@orcha-todo-example-app/client/shared/util';
import { tap } from 'rxjs/operators';

interface State {
  activeRoute: string;
}

@Component({
  selector: 'orcha-todo-example-app-app-shell',
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent extends StatefulComponent<State> implements OnInit {
  constructor(private readonly app: AppFacade, private readonly router: Router) {
    super({ activeRoute: '' });
  }

  ngOnInit(): void {
    this.updateState({ activeRoute: this.router.url });

    this.effect(() =>
      this.router.events.pipe(
        tap((res) => {
          if (res instanceof NavigationEnd) {
            this.updateState({ activeRoute: res.urlAfterRedirects });
          }
        })
      )
    );
  }

  logout() {
    this.app.user.dispatchers.logout();
  }

  todos() {
    this.router.navigate(['todos']);
  }

  tags() {
    this.router.navigate(['tags']);
  }

  profile() {
    this.router.navigate(['profile']);
  }
}
