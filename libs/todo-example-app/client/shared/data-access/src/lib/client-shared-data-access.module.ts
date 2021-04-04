import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { OrchaAngularModule } from '@orcha/angular';
import { AppFacade } from './app.facade';
import { AuthInterceptor } from './auth.interceptor';
import { TodoEffects } from './todo/todo.effects';
import { TodoOrchestration } from './todo/todo.orchestration';
import { TodoReducer, TODO_KEY } from './todo/todo.reducer';
import { UserEffects } from './user/user.effects';
import { UserOrchestration } from './user/user.orchestration';
import { UserReducer, USER_KEY } from './user/user.reducer';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature(USER_KEY, UserReducer),
    StoreModule.forFeature(TODO_KEY, TodoReducer),
    EffectsModule.forFeature([UserEffects, TodoEffects]),
    OrchaAngularModule.forFeature({
      orchestrations: [UserOrchestration, TodoOrchestration],
      interceptors: [AuthInterceptor],
    }),
  ],
  providers: [AppFacade, AuthInterceptor],
})
export class ClientSharedDataAccessModule {}
