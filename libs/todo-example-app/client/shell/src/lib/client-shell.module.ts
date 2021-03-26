import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppShellComponent } from './app-shell/app-shell.component';
import { AppGuard } from './app.guard';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { TodosComponent } from './todos/todos.component';

@NgModule({
  declarations: [AppShellComponent, LoginComponent, SignUpComponent, TodosComponent],
  providers: [AppGuard],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: AppShellComponent,
        canActivate: [AppGuard],
        children: [
          {
            path: '',
            component: TodosComponent,
          },
        ],
      },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'sign-up',
        component: SignUpComponent,
      },
    ]),
  ],
})
export class ClientShellModule {}
