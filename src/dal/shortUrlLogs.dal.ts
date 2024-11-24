import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ShortUrl } from 'src/entities/short_url.entity';
import { ShortUrlLogs } from 'src/entities/short_url_logs.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ShortUrlLogsDal {
  constructor(
    @InjectRepository(ShortUrl) private readonly shortUrl: Repository<ShortUrl>,
    @InjectRepository(ShortUrlLogs)
    private readonly shortUrlLogs: Repository<ShortUrlLogs>,
  ) {}

  async createShortUrlLogs(data): Promise<ShortUrlLogs> {
    try {
      const { shortUrl, ip, osName, deviceName } = data;
      const shortUrlLogs = this.shortUrlLogs.create({
        shortUrl,
        ip,
        osName,
        deviceName,
      });
      return await this.shortUrlLogs.save(shortUrlLogs);
    } catch (error) {
      throw new Error('Error saving short URL log');
    }
  }
}
