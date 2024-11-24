import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { DalModule } from './dal/dal.module';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ZodValidationFilter } from './common/filters/zod-validation.filter';
import { ZodValidationPipe } from 'nestjs-zod';
import { UrlModule } from './url/url.module';
import { ShortUrlUniqueOS } from './entities/short_url_os.entity';
import { ShortUrl } from './entities/short_url.entity';
import { ShortUrlLogs } from './entities/short_url_logs.entity';
import { ShortUrlUniqueDevice } from './entities/short_url_device.entity';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AnalyticsModule } from './analytics/analytics.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { RateLimitExceptionFilter } from './common/filters/rate-limiting.filter';
import { RateLimitService } from './common/service/rate-limiting.service';

@Module({
  imports: [
    RedisModule.forRoot({
      type: 'single',
      url: process.env.REDIS_URL,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UrlModule,
    DalModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        User,
        ShortUrl,
        ShortUrlUniqueDevice,
        ShortUrlUniqueOS,
        ShortUrlLogs,
      ],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([
      User,
      ShortUrl,
      ShortUrlUniqueOS,
      ShortUrlLogs,
      ShortUrlUniqueDevice,
    ]),
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtService,
    RateLimitService,
    {
      provide: APP_FILTER,
      useClass: RateLimitExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: ZodValidationFilter,
    },
  ],
})
export class AppModule {}
