import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/prisma/prisma.module';

// Domain
import { CATEGORY_REPOSITORY } from './domain/repositories/category.repository.interface';

// Infrastructure
import { CategoryRepository } from './infrastructure/repositories/category.repository';

// Application
import { CreateCategoryUseCase } from './application/use-cases/create-category.use-case';
import { UpdateCategoryUseCase } from './application/use-cases/update-category.use-case';
import { DeleteCategoryUseCase } from './application/use-cases/delete-category.use-case';
import { GetCategoriesUseCase } from './application/use-cases/get-categories.use-case';

// Presentation
import { CategoryController } from './presentation/controllers/category.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CategoryController],
  providers: [
    // Repository
    {
      provide: CATEGORY_REPOSITORY,
      useClass: CategoryRepository,
    },
    // Use Cases
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
    GetCategoriesUseCase,
  ],
  exports: [CATEGORY_REPOSITORY], // 导出给图书模块使用
})
export class CategoryModule {}
