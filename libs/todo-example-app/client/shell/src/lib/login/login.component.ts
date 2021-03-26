import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@ngneat/reactive-forms';
import { AppFacade } from '@orcha-todo-example-app/client/shared/data-access';
import { StatefulComponent } from '@orcha-todo-example-app/client/shared/util';
import { tap } from 'rxjs/operators';

interface State {
  error: string | null;
}

@Component({
  selector: 'orcha-todo-example-app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent extends StatefulComponent<State> implements OnInit {
  readonly loginForm = new FormGroup({
    id: new FormControl('', (c) => Validators.required(c)),
    password: new FormControl('', (c) => Validators.required(c)),
  });

  constructor(private readonly app: AppFacade, private readonly router: Router) {
    super({ error: null });
  }

  ngOnInit(): void {
    this.effect(() =>
      this.app.user.actionListeners.login.error.pipe(
        tap(({ error }) => {
          this.updateState({ error: error.message });
        })
      )
    );
  }

  login() {
    const { id, password } = this.loginForm.value;
    this.app.user.dispatchers.login(id, password);
  }

  signUpPage() {
    this.router.navigate(['/sign-up']);
  }
}
