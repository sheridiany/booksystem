import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * 领域异常基类
 *
 * 用于领域层抛出业务规则违反异常,
 * 将被全局异常过滤器捕获并转换为统一响应格式
 */
export class DomainException extends HttpException {
  constructor(message: string, statusCode: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(message, statusCode);
  }
}

/**
 * 实体未找到异常
 */
export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, id: string) {
    super(`${entityName} (ID: ${id}) 不存在`, HttpStatus.NOT_FOUND);
  }
}

/**
 * 业务规则违反异常
 */
export class BusinessRuleViolationException extends DomainException {
  constructor(message: string) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

/**
 * 资源冲突异常 (如唯一键冲突)
 */
export class ConflictException extends DomainException {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT);
  }
}
