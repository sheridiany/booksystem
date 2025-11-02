import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * 全局 HTTP 异常过滤器
 *
 * 将所有异常(包括领域异常)转换为统一错误响应格式:
 * {
 *   success: false,
 *   error: {
 *     code: <错误代码>,
 *     message: <错误信息>,
 *     details: <详细信息>
 *   },
 *   timestamp: <时间戳>
 * }
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // 提取错误信息
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || '未知错误';

    const errorCode = this.getErrorCode(status);

    response.status(status).json({
      success: false,
      error: {
        code: errorCode,
        message: Array.isArray(message) ? message.join(', ') : message,
        details: typeof exceptionResponse === 'object' ? exceptionResponse : {},
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 根据 HTTP 状态码生成错误代码
   */
  private getErrorCode(status: number): string {
    const errorCodeMap: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'BUSINESS_RULE_VIOLATION',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
    };

    return errorCodeMap[status] || 'UNKNOWN_ERROR';
  }
}
