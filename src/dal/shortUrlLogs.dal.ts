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

      // Check if the IP already exists for the given shortUrl
      const ipExists = await this.shortUrlLogs.findOne({
        where: { shortUrl: { alias: shortUrl.alias }, ip },
      });

      console.log("ip exist",ipExists);
      
      // Create a new log entry
      const shortUrlLogs = this.shortUrlLogs.create({
        shortUrl,
        ip,
        osName,
        deviceName,
      });
      await this.shortUrlLogs.save(shortUrlLogs);

      // Update totalClicks and uniqueClicks
      if (!ipExists) {
        // New IP: Increment both totalClicks and uniqueClicks
        await this.shortUrl.update(
          { alias: shortUrl.alias },
          {
            totalClicks: () => 'total_clicks + 1',
            uniqueClicks: () => 'unique_clicks + 1',
          },
        );
      } else {
        // Existing IP: Increment only totalClicks
        await this.shortUrl.update(
          { alias: shortUrl.alias },
          {
            totalClicks: () => 'total_clicks + 1',
          },
        );
      }

      return shortUrlLogs;
    } catch (error) {
      throw new Error('Error saving short URL log');
    }
  }
}
