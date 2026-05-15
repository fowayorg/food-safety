import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Optional,
} from '@nestjs/common';
import { Observable, tap, catchError } from 'rxjs';
import { throwError } from 'rxjs';
import { AuditLogsService } from '../../modules/audit-logs/audit-logs.service';
import { Request } from 'express';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(@Optional() private auditLogsService: AuditLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const handler = context.getHandler();
    const className = context.getClass().name;

    // 获取操作类型
    const method = request.method;
    let action = 'UNKNOWN';
    if (method === 'POST') action = 'CREATE';
    else if (method === 'PUT' || method === 'PATCH') action = 'UPDATE';
    else if (method === 'DELETE') action = 'DELETE';

    // 只记录写操作
    if (!['CREATE', 'UPDATE', 'DELETE'].includes(action)) {
      return next.handle();
    }

    // 提取模块名（去掉 Controller 后缀）
    const module = className.replace('Controller', '').toLowerCase();

    // 获取用户信息
    const user = (request as any).user;
    const userId = user?.id;

    // 获取目标 ID
    const rawTargetId = request.params?.id || request.params?.entityId;
    const targetId = Array.isArray(rawTargetId) ? rawTargetId[0] : rawTargetId;

    // 获取 IP 和 User-Agent
    const ip = request.ip || request.connection?.remoteAddress;
    const userAgent = request.headers['user-agent'];

    const startTime = Date.now();

    return next.handle().pipe(
      tap((result) => {
        // 成功时记录
        if (this.auditLogsService) {
          this.auditLogsService.create({
            userId,
            action,
            module,
            targetId,
            targetType: module,
            detail: JSON.stringify({
              method: request.method,
              path: request.path,
              body: this.sanitizeBody(request.body),
              result: this.sanitizeResult(result),
              duration: Date.now() - startTime,
            }),
            ip,
            userAgent,
            status: 'SUCCESS',
          }).catch(() => {}); // 静默失败，不影响主流程
        }
      }),
      catchError((error) => {
        // 失败时也记录
        if (this.auditLogsService) {
          this.auditLogsService.create({
            userId,
            action,
            module,
            targetId,
            targetType: module,
            detail: JSON.stringify({
              method: request.method,
              path: request.path,
              body: this.sanitizeBody(request.body),
              duration: Date.now() - startTime,
            }),
            ip,
            userAgent,
            status: 'FAILED',
            errorMsg: error.message || 'Unknown error',
          }).catch(() => {}); // 静默失败
        }
        return throwError(() => error);
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    const sanitized = { ...body };
    // 移除敏感字段
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.accessToken;
    delete sanitized.refreshToken;
    return sanitized;
  }

  private sanitizeResult(result: any): any {
    if (!result) return result;
    // 如果结果太大，只返回类型信息
    const str = JSON.stringify(result);
    if (str.length > 1000) {
      return { _type: 'truncated', length: str.length };
    }
    return result;
  }
}