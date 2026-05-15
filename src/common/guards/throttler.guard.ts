import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * 自定义 API 限流守卫
 *
 * 规则：
 * - 默认：60次/分钟
 * - 公开接口：30次/分钟（更严格）
 * - 可通过 @Throttle() 装饰器覆盖单个接口
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getErrorMessage(
    context: ExecutionContext,
    throttlerLimitDetail: any,
  ): Promise<string> {
    return '请求过于频繁，请稍后再试';
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: any,
  ): Promise<void> {
    const res = context.switchToHttp().getResponse();
    res.header('Retry-After', Math.ceil(throttlerLimitDetail.ttl / 1000));
    return super.throwThrottlingException(context, throttlerLimitDetail);
  }
}
