import { KIRTAN, KirtanOperationError } from '@kirtan/common';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class KirtanOperationErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception.getStatus instanceof Function ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const operation = (request.raw.url as string).split(`${KIRTAN}/`)[1];

    const errorResponse: KirtanOperationError = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      operation,
      message: exception.message,
    };

    Logger.error(
      `\nOperation:\t\t${operation}\nResponse:\t${JSON.stringify(errorResponse)}`,
      exception.stack,
      'KirtanErrorFilter'
    );

    response.status(status).send(errorResponse);
  }
}
