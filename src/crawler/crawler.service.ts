import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';
import { setTimeout } from 'timers';

@Injectable()
export class CrawlerService {
  constructor(private configService: ConfigService) {}

  public static SECONDS_DELAY = 2000;
  private async delay(time) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  }

  public async start(): Promise<any> {
    try {
      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();
      const navigationPromise = page.waitForNavigation();
      const email = this.configService.get<string>('EMAIL_ADDRESS');
      const password = this.configService.get<string>('PASSWORD');

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
    } catch (e) {
      console.error(e);
    }
  }

  private executeScript() {
    const selectedTime = '7:00 am';

    const bookings: any = (): Array<any> => {
      const results = [];
      const daysBooked = document.querySelectorAll(
        '#doorPolicyForm .reserved-slots .time-slot .time-slot-box',
      );
      for (let i = 0; i < daysBooked.length; i++) {
        const dayBooked: any = daysBooked[i];
        const [club, date, time] = dayBooked.children;
        results.push({
          club: club.innerText.toLowerCase(),
          date: date.innerText.toLowerCase(),
          time: time.innerText.toLowerCase(),
        });
      }
      return results;
    };

    const selectClub = (callback: any) => {
      const button: any = document.querySelector('#btn_club_select');
      button.click();
      const club: any = document.querySelector(
        '#club_55346EEC-71F1-4A6E-BD17-5D4EA39E144B',
      );
      club.click();
      callback(bookings);
    };

    const selectTime = (callback) => {
      const selectDate: any = document.querySelector('#btn_date_select');
      selectDate.click();
      const avaialableDays: any = document.querySelectorAll(
        '#modal_dates .modal-body .dialog-content .md-option',
      );
      const daysBooked: any = callback();
      for (let i = 0; i < avaialableDays.length; i++) {
        const avaialableDay: any = avaialableDays[i].innerText
          .toLowerCase()
          .trim();
        for (const dayBooked of daysBooked) {
          const { date, time } = dayBooked;
          if (date === avaialableDay && time.includes(selectedTime)) {
            continue;
          } else {
            avaialableDays[i].click();
            const daysAvailable = document.querySelectorAll(
              '.available-slots .time-slot-box',
            );
            alert(daysAvailable.length);
          }
        }
      }
    };

    selectClub(selectTime);
  }
}
