import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      message: '高斯图书借阅系统 API',
      timestamp: new Date().toISOString(),
    };
  }
}
