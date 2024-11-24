import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ShortUrl } from 'src/entities/short_url.entity';
import { ShortUrlUniqueDevice } from 'src/entities/short_url_device.entity';
import { ShortUrlUniqueOS } from 'src/entities/short_url_os.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AnalyticsDal {
  constructor(
    @InjectRepository(ShortUrl)
    private readonly shortUrlRepository: Repository<ShortUrl>
  ) {}

  async getAnalytics(alias: string) {
    const shortUrlAnalytics = await this.shortUrlRepository
      .createQueryBuilder('shortUrl')
      .leftJoinAndSelect('shortUrl.uniqueDevices', 'device')
      .leftJoinAndSelect('shortUrl.uniqueOS', 'os')
      .where('shortUrl.alias = :alias', { alias })
      .select([
        'shortUrl.totalClicks',
        'shortUrl.uniqueClicks',
        'shortUrl.clickByDate',
        'device.deviceName',
        'device.ukClick',
        'device.ukUser',
        'os.osName',
        'os.ukClick',
        'os.ukUser',
      ])
      .getOne();

    if (!shortUrlAnalytics) {
      throw new NotFoundException('Short URL not found');
    }

    return {
      totalClicks: shortUrlAnalytics.totalClicks,
      uniqueClicks: shortUrlAnalytics.uniqueClicks,
      clicksByDate: shortUrlAnalytics.clickByDate,
      osType: shortUrlAnalytics.uniqueOS.map((os) => ({
        osName: os.osName,
        uniqueClicks: os.ukClick,
        uniqueUsers: os.ukUser,
      })),
      deviceType: shortUrlAnalytics.uniqueDevices.map((device) => ({
        deviceName: device.deviceName,
        uniqueClicks: device.ukClick,
        uniqueUsers: device.ukUser,
      })),
    };
  }

  async getAnalyticsByTopic(topic: string) {
    const analytics = await this.shortUrlRepository
      .createQueryBuilder('shortUrl')
      .select([
        'shortUrl.shortUrl',
        'shortUrl.totalClicks',
        'shortUrl.uniqueClicks',
        'shortUrl.clickByDate',
      ])
      .where('shortUrl.topic = :topic', { topic })
      .getMany();

    if (analytics.length === 0) {
      throw new NotFoundException(
        'No short URLs found under the specified topic',
      );
    }

    const totalClicks = analytics.reduce(
      (sum, url) => sum + url.totalClicks,
      0,
    );
    const uniqueClicks = analytics.reduce(
      (sum, url) => sum + url.uniqueClicks,
      0,
    );

    return {
      totalClicks,
      uniqueClicks,
      clicksByDate: analytics.map((url) => url.clickByDate),
      urls: analytics.map((url) => ({
        shortUrl: url.shortUrl,
        totalClicks: url.totalClicks,
        uniqueClicks: url.uniqueClicks,
      })),
    };
  }
}
