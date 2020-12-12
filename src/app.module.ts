import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MorganModule, MorganInterceptor } from 'nest-morgan';
import { Module } from '@nestjs/common';
import { HomeModule } from './home/home.module';
import { CrawlerModule } from './crawler/crawler.module';
@Module({
  imports: [
    MorganModule.forRoot(),
    ConfigModule.forRoot(),
    HomeModule,
    CrawlerModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: MorganInterceptor('dev'),
    },
  ],
})
export class AppModule {}
