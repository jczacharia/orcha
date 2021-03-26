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
  selector: 'orcha-todo-example-app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpComponent extends StatefulComponent<State> implements OnInit {
  readonly signUpForm = new FormGroup({
    id: new FormControl('', (c) => Validators.required(c)),
    password: new FormControl('', (c) => Validators.required(c)),
  });

  constructor(private readonly app: AppFacade, private readonly router: Router) {
    super({ error: null });
  }

  ngOnInit(): void {
    this.effect(() =>
      this.app.user.actionListeners.signUp.error.pipe(
        tap(({ error }) => {
          this.updateState({ error: error.message });
        })
      )
    );
  }

  signUp() {
    const { id, password } = this.signUpForm.value;
    this.app.user.dispatchers.signUp(id, password);
  }

  loginPage() {
    this.router.navigate(['/login']);
  }
}
