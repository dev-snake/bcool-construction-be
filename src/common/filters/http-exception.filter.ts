import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { translateErrorMessage } from '../utils/localization.util';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: (exception as Error).message };

    const message =
      typeof exceptionResponse === 'object' && exceptionResponse['message']
        ? exceptionResponse['message']
        : exceptionResponse;

    const code =
      typeof exceptionResponse === 'object' && typeof exceptionResponse['error'] === 'string'
        ? exceptionResponse['error'].toUpperCase().replace(/\s+/g, '_')
        : 'INTERNAL_SERVER_ERROR';

    const finalMessage = Array.isArray(message)
      ? message.map((msg) => translateErrorMessage(msg)).join(', ')
      : translateErrorMessage(message as string);

    response.status(status).json({
      code,
      message: finalMessage,
      timestamp: new Date().toISOString(),
    });
  }
}
