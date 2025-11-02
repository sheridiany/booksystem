import { IsString, IsNotEmpty, MinLength } from 'class-validator';

/**
 * 登录请求 DTO
 */
export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username!: string;

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度至少6位' })
  password!: string;
}

/**
 * 登录响应 DTO
 */
export class LoginResponseDto {
  accessToken!: string;
  user!: {
    id: string;
    username: string;
    role: string;
  };
}
