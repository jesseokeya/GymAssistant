import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { HomeService } from './home.service';
import { MorganInterceptor } from 'nest-morgan';
@UseInterceptors(MorganInterceptor('dev'))
@Controller()
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get(['/', '/home'])
  getHello(): string {
    return this.homeService.getHome();
  }
}
