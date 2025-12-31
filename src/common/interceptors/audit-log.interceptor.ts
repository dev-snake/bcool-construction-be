import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LogsService } from '../../modules/logs/logs.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly logsService: LogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const response = http.getResponse();

    const { method, url, user } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        const statusCode = response.statusCode;
        const time = new Date().toLocaleTimeString('en-GB', { hour12: false });

        // Simple log format: [INFO] 21:38:09 GET /api/v1/cms/home 200 - 42ms
        console.log(
          `[INFO] ${time} ${method} ${url} ${statusCode} - ${duration}ms`,
        );

        // Async save to DB
        this.logsService
          .createActivityLog({
            userId: user?.id,
            module: url.split('/')[3] || 'Global', // api/v1/[module]
            action: method,
            ipAddress: request.ip,
          })
          .catch((err) => {
            console.error('Failed to save audit log', err);
          });
      }),
    );
  }
}
