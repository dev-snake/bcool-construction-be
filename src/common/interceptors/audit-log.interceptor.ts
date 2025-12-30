import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Logger } from 'nestjs-pino';
import { LogsService } from '../../modules/logs/logs.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: Logger,
    private readonly logsService: LogsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        this.logger.log({
          message: `Audit Log: ${method} ${url}`,
          userId: user?.id,
          method,
          url,
          duration,
        });

        // Async save to DB
        this.logsService
          .createActivityLog({
            userId: user?.id,
            module: url.split('/')[3] || 'Global', // api/v1/[module]
            action: method,
            ipAddress: request.ip,
          })
          .catch((err) => {
            // Use console.error or logger.error if logger is available in this context
            console.error('Failed to save audit log', err);
          });
      }),
    );
  }
}
