import { Injectable } from '@nestjs/common';
import { Book } from '@/modules/book/domain/entities/book.entity';
import { Reader } from '@/modules/reader/domain/entities/reader.entity';

/**
 * 借阅领域服务 (Borrow Domain Service)
 *
 * 职责：
 * - 借阅资格校验
 * - 复杂业务规则判断
 */
@Injectable()
export class BorrowDomainService {
  /**
   * 检查读者是否可以借阅指定图书
   *
   * 业务规则：
   * 1. 图书库存是否充足
   * 2. 读者状态是否激活
   * 3. 读者是否达到借阅上限
   * 4. 读者是否有逾期未还图书
   *
   * @param book 图书实体
   * @param reader 读者实体
   * @param currentBorrowCount 读者当前借阅数量（需要从仓储查询）
   * @param hasOverdueBorrows 读者是否有逾期未还图书（需要从仓储查询）
   * @returns 校验结果
   */
  canBorrow(
    book: Book,
    reader: Reader,
    currentBorrowCount: number,
    hasOverdueBorrows: boolean,
  ): {
    can: boolean;
    reason?: string;
  } {
    // 1. 检查图书库存
    if (!book.hasAvailableCopies()) {
      return {
        can: false,
        reason: '图书库存不足，暂时无法借阅',
      };
    }

    // 2. 检查读者状态
    if (!reader.isActive()) {
      return {
        can: false,
        reason: '读者账号已被禁用，无法借阅',
      };
    }

    // 3. 检查借阅上限
    if (currentBorrowCount >= reader.maxBorrowLimit) {
      return {
        can: false,
        reason: `已达借阅上限 (${reader.maxBorrowLimit} 本)，请先归还部分图书`,
      };
    }

    // 4. 检查是否有逾期未还图书
    if (hasOverdueBorrows) {
      return {
        can: false,
        reason: '存在逾期未还图书，请先归还逾期图书',
      };
    }

    return { can: true };
  }

  /**
   * 检查图书是否可以删除
   * 有借阅记录的图书不能删除
   */
  canDeleteBook(hasActiveBorrows: boolean): {
    can: boolean;
    reason?: string;
  } {
    if (hasActiveBorrows) {
      return {
        can: false,
        reason: '该图书存在未归还的借阅记录，无法删除',
      };
    }

    return { can: true };
  }

  /**
   * 检查读者是否可以删除
   * 有未归还图书的读者不能删除
   */
  canDeleteReader(hasActiveBorrows: boolean): {
    can: boolean;
    reason?: string;
  } {
    if (hasActiveBorrows) {
      return {
        can: false,
        reason: '该读者有未归还图书，无法删除',
      };
    }

    return { can: true };
  }

  /**
   * 计算借阅费用（如果需要）
   * 暂时未实现，预留接口
   */
  calculateBorrowFee(borrowDays: number): number {
    // 可以根据借阅天数计算费用
    // 例如：每天0.5元
    return borrowDays * 0.5;
  }

  /**
   * 计算逾期罚金（如果需要）
   * 暂时未实现，预留接口
   */
  calculateOverdueFee(overdueDays: number): number {
    // 可以根据逾期天数计算罚金
    // 例如：每天1元
    return overdueDays * 1.0;
  }
}
