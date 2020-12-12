import { Test, TestingModule } from '@nestjs/testing';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

describe('HomeController', () => {
  let home: TestingModule;

  beforeAll(async () => {
    home = await Test.createTestingModule({
      controllers: [HomeController],
      providers: [HomeService],
    }).compile();
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      const appController = home.get<HomeController>(HomeController);
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
