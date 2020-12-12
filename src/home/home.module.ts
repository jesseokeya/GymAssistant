import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { MiddlewareController } from 'src/middleware/middleware.controller';
@Module({
  providers: [HomeService],
  controllers: [HomeController],
  exports: [],
})
export class HomeModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MiddlewareController)
      .forRoutes({ path: '/', method: RequestMethod.ALL });
  }
}
