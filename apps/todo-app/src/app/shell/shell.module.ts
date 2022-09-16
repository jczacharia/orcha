import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { RouterModule } from '@angular/router';
import { AppShellComponent } from './app-shell/app-shell.component';
import { AppGuard } from './app.guard';
import { LoginGuard } from './login.guard';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { QueryProfileComponent } from './query-profile/query-profile.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { TodosComponent } from './todos/todos.component';

@NgModule({
  declarations: [
    AppShellComponent,
    LoginComponent,
    SignUpComponent,
    TodosComponent,
    ProfileComponent,
    QueryProfileComponent,
  ],
  providers: [AppGuard, LoginGuard],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    RouterModule.forChild([
      {
        path: 'login',
        component: LoginComponent,
        canActivate: [LoginGuard],
      },
      {
        path: 'sign-up',
        component: SignUpComponent,
        canActivate: [LoginGuard],
      },
      {
        path: '',
        component: AppShellComponent,
        canActivate: [AppGuard],
        children: [
          {
            path: 'todos',
            component: TodosComponent,
          },
          {
            path: 'profile',
            component: ProfileComponent,
          },
          {
            path: 'query',
            component: QueryProfileComponent,
          },
          { path: '**', pathMatch: 'full', redirectTo: 'todos' },
        ],
      },
    ]),
  ],
})
export class ShellModule {}
