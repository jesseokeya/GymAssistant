import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class CrawlerService {
  public static SECONDS_DELAY = 1500;
  private async delay(time) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  }

  public async start(): Promise<any> {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    const email = process.env.EMAIL_ADDRESS;
    const password = process.env.PASSWORD;

    const emailInput = '#API > #block_fields #emailaddress';
    const passwordInput = '#API > #block_fields #password';

    await page.goto('https://myfit4less.gymmanager.com/portal/login.asp');
    await page.setViewport({ width: 1280, height: 653 });
    await page.waitForSelector(emailInput);

    await page.type(emailInput, email);
    await page.waitForSelector(passwordInput);
    await page.type(passwordInput, password);

    await page.waitForSelector(
      '.login-box > #API > #block_buttons #loginButton',
    );
    await page.click('.login-box > #API > #block_buttons #loginButton');
    await this.delay(CrawlerService.SECONDS_DELAY);
    await page.screenshot({ path: 'screenshot.png' });
    // evaluate will run the function in the page context
    await page.evaluate(this.executeScript);
    await browser.close();
    return {
      msg: 'Fit4less session was sucessfully booked',
      status: 200,
    };
  }

  private executeScript() {
    console.log('here!!');
  }
}
