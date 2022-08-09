import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ORCHA, OrchaOperationError } from '@orcha/common';

@Catch()
export class OrchaOperationErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception.getStatus instanceof Function ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const operation = (request.url as string).split(`${ORCHA}/`)[1];

    const errorResponse: OrchaOperationError = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      operation,
      message: exception.message,
      response: typeof exception.getResponse === 'function' ? exception.getResponse() : exception.message,
    };

    Logger.error(
      `\nOperation:\t\t${operation}\nResponse:\t${JSON.stringify(errorResponse)}`,
      exception.stack,
      'OrchaErrorFilter'
    );

    response.status(status).send(errorResponse);
  }
}
