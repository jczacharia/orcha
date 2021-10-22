import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@ngneat/reactive-forms';
import { AppFacade } from '@orcha-todo-example-app/client/shared/data-access';
import { RxJSBaseClass } from '@orcha-todo-example-app/client/shared/util';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'orcha-todo-example-app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpComponent extends RxJSBaseClass implements OnInit {
  readonly signUpForm = new FormGroup({
    id: new FormControl('', (c) => Validators.required(c)),
    password: new FormControl('', (c) => Validators.required(c)),
  });

  error: string | null = null;

  constructor(
    private readonly app: AppFacade,
    private readonly router: Router,
    private readonly _change: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.app.user.actionListeners.signUp.error.pipe(takeUntil(this.destroy$)).subscribe(({ error }) => {
      this.error = error.message;
      this._change.markForCheck();
    });
  }

  signUp() {
    const { id, password } = this.signUpForm.value;
    this.app.user.dispatchers.signUp(id, password);
  }

  loginPage() {
    this.router.navigate(['/login']);
  }
}
