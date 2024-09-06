import { Browser } from 'puppeteer';
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import Yelp from './websites/yelp';

puppeteer.use(StealthPlugin());

async function Main() {
    const browser: Browser = await puppeteer.launch({
        headless: false,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = (await browser.pages())[0]

    // Conditional
    let targetSite;
    switch (null) {
        default:
            targetSite = new Yelp(page, browser)
            break;
    }

    // Process
    try {

        await targetSite.navigate()

        await targetSite.search("royal")

        const sponsored = await targetSite.fetchSponsored()
        console.log(sponsored)

        for (let s of sponsored) {
            if (!s) continue
            await targetSite.navigate(s, true)
            await new Promise(r => setTimeout(r, 5000))
        }
    } catch (error: any) {
        console.log(error.message)
        await page.close()
        await browser.close()
    }

    await page.close()
    await browser.close()
}

Main().catch(e => console.log(e.message))