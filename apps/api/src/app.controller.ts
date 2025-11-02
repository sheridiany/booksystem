import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './shared/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * 健康检查端点 (公开访问)
   */
  @Public()
  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }
}
