import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { OrchaAngularModule,  } from '@orcha/angular';
import { AppComponent } from './app.component';
import { ExOrchestration } from './ex';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    OrchaAngularModule.forRoot('http://localhost:3333'),
    OrchaAngularModule.forFeature({
      orchestrations: [ExOrchestration],
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
