import { IQuery } from '@orcha/common';
import { IServerOrchestration, ServerOperation, ServerOrchestration } from '@orcha/nestjs';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { ExDto, IExOrchestration } from '../../../example-app/src/app/ex';

@ServerOrchestration('ex')
export class AppOrchestration implements IServerOrchestration<IExOrchestration> {
  @ServerOperation({ validateQuery: { res: true } })
  fileUpload(query: IQuery<{ res: string }>, token: string, dto: ExDto) {
    console.log(query, dto, token);
    return { res: 'dfd' } as any;
  }
}
