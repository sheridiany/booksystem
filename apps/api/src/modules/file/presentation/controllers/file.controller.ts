/**
 * FileController - 文件管理控制器
 *
 * 职责:
 * - 处理文件相关的 HTTP 请求
 * - 文件上传接口 (multipart/form-data)
 * - 文件元数据查询接口
 * - 文件下载/访问接口
 */

import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Res,
  NotFoundException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UploadFileUseCase } from '../../application/use-cases/upload-file.use-case';
import { GetFileMetadataUseCase } from '../../application/use-cases/get-file-metadata.use-case';
import { DeleteFileUseCase } from '../../application/use-cases/delete-file.use-case';
import { FileStorageService } from '../../infrastructure/services/file-storage.service';
import { Public } from '../../../../shared/decorators/public.decorator';

@Controller('files')
@Public() // 临时设置为公开访问,后续添加权限控制
export class FileController {
  constructor(
    private readonly uploadFileUseCase: UploadFileUseCase,
    private readonly getFileMetadataUseCase: GetFileMetadataUseCase,
    private readonly deleteFileUseCase: DeleteFileUseCase,
    private readonly fileStorageService: FileStorageService,
  ) {}

  /**
   * 文件上传接口
   * POST /api/v1/files/upload
   *
   * @param file - 上传的文件 (from multipart/form-data)
   * @param uploadedBy - 上传者用户 ID (临时从 query 获取，后续从 JWT 获取)
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    // TODO: 后续从 JWT token 中获取当前用户 ID
    // @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    // 临时硬编码 uploadedBy，后续从 JWT 获取
    const uploadedBy = 'admin-user-id'; // req.user.id

    const result = await this.uploadFileUseCase.execute({
      file,
      uploadedBy,
    });

    return {
      success: true,
      data: result,
      message: '文件上传成功',
    };
  }

  /**
   * 删除文件 (必须放在 GET :id 之前,避免路由冲突)
   * DELETE /api/v1/files/:id
   */
  @Delete(':id')
  async deleteFile(@Param('id') id: string) {
    await this.deleteFileUseCase.execute(id);

    return {
      success: true,
      message: '文件删除成功',
    };
  }

  /**
   * 获取文件元数据
   * GET /api/v1/files/:id
   */
  @Get(':id')
  async getFileMetadata(@Param('id') id: string) {
    const metadata = await this.getFileMetadataUseCase.execute(id);

    return {
      success: true,
      data: metadata,
    };
  }

  /**
   * 文件下载/访问接口
   * GET /api/v1/files/:id/download
   *
   * 返回文件流供浏览器下载或预览
   */
  @Get(':id/download')
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    // 1. 获取文件元数据
    const metadata = await this.getFileMetadataUseCase.execute(id);

    // 2. 检查文件是否存在
    const fileExists = await this.fileStorageService.fileExists(
      metadata.filePath,
    );
    if (!fileExists) {
      throw new NotFoundException('文件不存在');
    }

    // 3. 读取文件内容
    const fileBuffer = await this.fileStorageService.readFile(
      metadata.filePath,
    );

    // 4. 设置响应头
    res.setHeader('Content-Type', metadata.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(metadata.originalName)}"`,
    );
    res.setHeader('Content-Length', fileBuffer.length);

    // 5. 发送文件流
    res.status(HttpStatus.OK).send(fileBuffer);
  }

  /**
   * 获取文件访问 URL
   * GET /api/v1/files/:id/url
   */
  @Get(':id/url')
  async getFileUrl(@Param('id') id: string) {
    const metadata = await this.getFileMetadataUseCase.execute(id);

    // 生成文件访问 URL
    const fileUrl = `/api/v1/files/${id}/download`;

    return {
      success: true,
      data: {
        fileId: id,
        fileUrl,
        fileName: metadata.originalName,
        fileType: metadata.fileType,
        size: metadata.size,
      },
    };
  }
}
