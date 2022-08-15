import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { OrchaLogicPipe } from './orcha-logic.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [OrchaLogicPipe],
  exports: [OrchaLogicPipe],
})
export class OrchaLogicModule {}
