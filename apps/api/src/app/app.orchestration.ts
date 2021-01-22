import { IQuery } from '@orcha/common';
import { IServerOrchestration, ServerOperation, ServerOrchestration } from '@orcha/nestjs';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { ExDto, IExOrchestration } from '../../../example-app/src/app/ex';

@ServerOrchestration('ex')
export class AppOrchestration implements IServerOrchestration<IExOrchestration> {
  @ServerOperation()
  fileUpload(query: IQuery<{ res: string }>, token: string, dto: ExDto, files: Express.Multer.File[]) {
    console.log(query, dto, token, files);
    return { res: 'dfd' } as any;
  }
}
