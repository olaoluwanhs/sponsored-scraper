import { Browser } from 'puppeteer';
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import Yelp from './websites/yelp';
import { writeObject } from './json-db';
import Groupon from './websites/groupon';

puppeteer.use(StealthPlugin());

async function Main() {
    const browser: Browser = await puppeteer.launch({
        headless: false,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = (await browser.pages())[0]

    // Conditional
    const site = 'groupon'
    let targetSite;
    switch (site) {
        // case 'yelp':
        //     targetSite = new Yelp(page, browser)
        //     break;
        // case 'groupon':
        //     targetSite = new Groupon(page, browser)
        //     break;
        default:
            targetSite = new Groupon(page, browser)
            break;
    }

    // Process
    try {

        await targetSite.navigate()

        await targetSite.search("Spa")

        const sponsored = await targetSite.fetchSponsored()
        console.log(sponsored)

        for (let s of sponsored) {
            if (!s) continue
            await targetSite.navigate(s, false)
            const businessInfo = await targetSite.getBusinessInformation()

            // console.log(businessInfo)
            await writeObject(businessInfo)
            await new Promise(r => setTimeout(r, 7000))
        }
    } catch (error: any) {
        console.log(error.message)
        // console.log(error.stack)
        // await page.close()
        await browser.close()
    }

    // await page.close()
    await browser.close()
}

Main().catch(e => console.log(e.message))