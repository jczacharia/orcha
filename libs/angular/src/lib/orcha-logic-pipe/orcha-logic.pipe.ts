import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe for using `createLogic` functions in templates.
 */
@Pipe({ name: 'orchaLogic' })
export class OrchaLogicPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform<F extends (...args: any[]) => any>(logicFn: F, ...args: Parameters<F>) {
    return logicFn(...args) as ReturnType<F>;
  }
}
