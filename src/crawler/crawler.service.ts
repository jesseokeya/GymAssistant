import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class CrawlerService {
  public static SECONDS_DELAY = 2000;
  private async delay(time) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  }

  public async start(): Promise<any> {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const navigationPromise = page.waitForNavigation();
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
    await navigationPromise;

    await Promise.all([
      page.waitForSelector('.col-md-12 #btn_club_select'),
      page.waitForSelector(
        '.modal-dialog #club_55346EEC-71F1-4A6E-BD17-5D4EA39E144B',
      ),
    ]);

    await navigationPromise;

    await page.evaluate(this.executeScript);
    await page.screenshot({ path: 'screenshot.png' });
    // await browser.close();

    return {
      msg: 'Fit4less session was sucessfully booked',
      status: 200,
    };
  }

  private executeScript() {
    const selectClub = () => {
      const button: any = document.querySelector('#btn_club_select');
      button.click();
      setTimeout(() => {
        const club: any = document.querySelector(
          '#club_55346EEC-71F1-4A6E-BD17-5D4EA39E144B',
        );
        club.click();
      }, 500);
    };

    selectClub();
  }
}
