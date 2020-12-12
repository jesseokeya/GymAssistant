import { Module } from '@nestjs/common';
import { HomeController } from './home/home.controller';
import { HomeModule } from './home/home.module';
@Module({
  imports: [HomeModule],
  controllers: [HomeController],
  providers: [],
})
export class AppModule {}
