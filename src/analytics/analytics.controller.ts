import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { GoogleAuthGuard } from 'src/common/guard/jwt.guard';

@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @UseGuards(GoogleAuthGuard)
  @Get(':alias')
  async getAnalyticsByAlias(@Param('alias') alias: string) {
    return this.analyticsService.getAnalyticsForAlias(alias);
  }

  @UseGuards(GoogleAuthGuard)
  @Get('topic/:topic')
  async getAnalyticsByTopic(@Param('topic') topic: string) {
    return this.analyticsService.getAnalyticsForTopic(topic);
  }
}
