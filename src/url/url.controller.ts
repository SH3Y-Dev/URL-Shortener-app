import {  Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateShortUrlDTO } from 'src/common/dto/url.dto';
import { GoogleAuthGuard } from 'src/common/guard/jwt.guard';
import { Request, Response } from 'express';
@Controller('api')
export class UrlController {
  constructor(private urlService: UrlService) {}

  @UseGuards(GoogleAuthGuard)
  @Post('shorten')
  async createShortUrl(@Body() createShortUrlDto: CreateShortUrlDTO) {
    const { longUrl, customAlias, topic } = createShortUrlDto;

    const shortUrl = await this.urlService.createShortUrl(
      longUrl,
      customAlias,
      topic,
    );

    return {
      shortUrl: shortUrl.shortUrl,
      createdAt: shortUrl.created,
    };
  }

  @Get('shorten/:alias')
  async redirectToLongUrl(
    @Param('alias') alias: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const longUrl = await this.urlService.redirectAndTrack(alias, request);
      response.redirect(longUrl);
    } catch (error) {
      response.status(404).send('Short URL not found');
    }
  }
}
