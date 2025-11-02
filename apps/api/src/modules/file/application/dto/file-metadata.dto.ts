/**
 * FileMetadataDto - 文件元数据响应 DTO
 *
 * 用于文件元数据查询接口的响应
 */

export interface FileMetadataDto {
  id: string;
  originalName: string;
  storedName: string;
  filePath: string;
  fileType: string;
  mimeType: string;
  size: number;
  formattedSize: string;
  uploadedBy: string;
  createdAt: Date;
  fileUrl?: string; // 文件访问 URL (由控制器层添加)
}
