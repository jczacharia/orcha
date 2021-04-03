import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { OrchaAngularModule } from '@orcha/angular';
import { AppFacade } from './app.facade';
import { AuthInterceptor } from './auth.interceptor';
import { TagEffects } from './tag/tag.effects';
import { TagOrchestration } from './tag/tag.orchestration';
import { TagReducer, TAG_KEY } from './tag/tag.reducer';
import { TodoTagEffects } from './todo-tag/todo-tag.effects';
import { TodoTagOrchestration } from './todo-tag/todo-tag.orchestration';
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
    StoreModule.forFeature(TAG_KEY, TagReducer),
    EffectsModule.forFeature([UserEffects, TagEffects, TodoTagEffects, TodoEffects]),
    OrchaAngularModule.forFeature({
      orchestrations: [UserOrchestration, TodoOrchestration, TodoTagOrchestration, TagOrchestration],
      interceptors: [AuthInterceptor],
    }),
  ],
  providers: [AppFacade, AuthInterceptor],
})
export class ClientSharedDataAccessModule {}
