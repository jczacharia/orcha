import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { OrchaModule } from '@orcha/angular';
import { AppFacade } from './app.facade';
import { TagEffects } from './tag/tag.effects';
import { TagGateway } from './tag/tag.gateway';
import { TagReducer, TAG_KEY } from './tag/tag.reducer';
import { TodoEffects } from './todo/todo.effects';
import { TodoGateway } from './todo/todo.gateway';
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
    EffectsModule.forFeature([UserEffects, TodoEffects, TagEffects]),
    OrchaModule.forFeature({
      orchestrations: [UserOrchestration, TodoOrchestration],
      gateways: [TodoGateway, TagGateway],
    }),
  ],
  providers: [AppFacade],
})
export class ClientSharedDataAccessModule {}
