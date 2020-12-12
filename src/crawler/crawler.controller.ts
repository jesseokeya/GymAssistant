import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { MorganInterceptor } from 'nest-morgan';
@UseInterceptors(MorganInterceptor('dev'))
@Controller()
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Get('/crawler')
  async start(): Promise<any> {
    const crawl = await this.crawlerService.start();
    return crawl;
  }
}
