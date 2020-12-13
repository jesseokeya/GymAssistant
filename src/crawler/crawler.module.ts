import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlerController } from './crawler.controller';
import { ConfigService } from '@nestjs/config';
import { MiddlewareController } from 'src/middleware/middleware.controller';
@Module({
  providers: [CrawlerService, ConfigService],
  controllers: [CrawlerController],
  exports: [],
})
export class CrawlerModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MiddlewareController)
      .forRoutes({ path: '/', method: RequestMethod.ALL });
  }
}
