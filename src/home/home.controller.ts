import { Controller, Get } from '@nestjs/common';
import { HomeService } from './home.service';
// import { MorganModule, MorganInterceptor } from 'nest-morgan';

// @UseInterceptors(MorganInterceptor('combined'))
@Controller()
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get(['/', '/home'])
  getHello(): string {
    return this.homeService.getHello();
  }
}
