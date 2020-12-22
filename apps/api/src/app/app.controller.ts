import { ServerOperation, ServerOperations } from '@kirtan/nestjs';

@ServerOperations()
export class AppControllers {
  @ServerOperation()
  getData() {
    //
    return {} as any;
  }
}
