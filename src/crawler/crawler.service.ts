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
      const selectedTime = '7:00 am';
      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();
      const navigationPromise = page.waitForNavigation();
      const email = this.configService.get<string>('EMAIL_ADDRESS');
      const password = this.configService.get<string>('PASSWORD');

      const emailInput = '#API > #block_fields #emailaddress';
      const passwordInput = '#API > #block_fields #password';

      await page.goto('https://myfit4less.gymmanager.com/portal/login.asp');
      await page.setViewport({ width: 1366, height: 768 });
      await page.setDefaultNavigationTimeout(90000);

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
      await this.delay(1500);

      await page.waitForSelector('#doorPolicyForm .reserved-slots');
      await page.evaluate(this.selectClub);

      const bookings = await page.evaluate(this.getBookings);
      if (bookings.length >= 2) await browser.close();

      await this.delay(1500);
      const availableDays: any = await page.evaluate(this.availableDays);

      const jobs: Array<any> = [],
        daysBooked: Array<string> = [];

      for (const available of availableDays) {
        let shouldBook = false;
        const { availableDay, reference } = available;
        if (bookings.length === 0) shouldBook = true;
        for (const booking of bookings) {
          const { date } = booking;
          if (date === availableDay) continue;
          else shouldBook = true;
        }
        if (shouldBook) jobs.push({ availableDay, reference });
      }

      if (jobs.length === 0) await browser.close();

      let index = 0;
      for (const job of jobs) {
        const { availableDay, reference } = job;
        daysBooked.push(availableDay);
        await this.bookDays({
          page,
          reference,
          selectedTime,
          index,
        });
        index++;
        await navigationPromise;
      }

      await page.screenshot({ path: 'screenshot.png' });
      await browser.close();

      return {
        msg: 'Fit4less session was sucessfully booked',
        status: 200,
        daysBooked,
      };
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  private async bookDays({ page, reference, selectedTime, index }: any) {
    console.log({ reference, selectedTime });
    if (index > 0) {
      await this.delay(1000);
      await page.waitForSelector('#btn_date_select');
      await page.click('#btn_date_select');
    }

    console.log(reference);
    await this.delay(2000);
    const resp = await page.waitForSelector(reference);
    if (resp) {
      await page.evaluate((reference) => {
        alert(reference);
        const target: any = document.querySelector(reference);
        if (target) target.click();
      }, reference);
    }

    console.log({ reference, selectedTime });
  }

  private getBookings(): Array<any> {
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
  }

  private selectClub() {
    const button: any = document.querySelector('#btn_club_select');
    button.click();
    const club: any = document.querySelector(
      '#club_55346EEC-71F1-4A6E-BD17-5D4EA39E144B',
    );
    club.click();
  }

  private availableDays(): Array<string> {
    const results = [];
    const selectDate: any = document.querySelector('#btn_date_select');
    selectDate.click();
    const availableDays: any = document.querySelectorAll(
      '#modal_dates .modal-body .dialog-content .md-option',
    );
    for (let i = 0; i < availableDays.length; i++) {
      const day = availableDays[i];
      if (day && day.innerText) {
        const idx = i + 1;
        const availableDay: string = day.innerText.toLowerCase().trim();
        results.push({
          availableDay,
          reference: `#modal_dates .modal-body .dialog-content .md-option:nth-child(${idx})`,
        });
      }
    }
    return results;
  }
}
