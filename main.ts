import { Browser } from 'puppeteer';
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import Yelp from './websites/yelp';
import { writeObject } from './json-db';
import Groupon from './websites/groupon';
const prompt = require('multiselect-prompt')

puppeteer.use(StealthPlugin());

const term = process.argv[2]

async function Main(sites: string) {
    const browser: Browser = await puppeteer.launch({
        headless: false,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = (await browser.pages())[0]
    await page.setRequestInterception(true);

    page.on('request', (req) => {
        if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
            req.abort();
        }
        else {
            req.continue();
        }
    })


    // Conditional
    let targetSite;
    switch (sites) {
        case 'yelp':
            targetSite = new Yelp(page, browser)
            break;
        case 'groupon':
            targetSite = new Groupon(page, browser)
            break;
        default:
            console.log(`Unknown site`)
            // targetSite = new Groupon(page, browser)
            break;
    }

    if (!targetSite) return;

    // Process
    try {

        await targetSite.navigate()

        await targetSite.search(term)

        const sponsored = await targetSite.fetchSponsored()

        for (let s of sponsored) {
            if (!s) continue
            await targetSite.navigate(s, !s.startsWith('https'))
            const businessInfo = await targetSite.getBusinessInformation()

            await writeObject(businessInfo)
            await new Promise(r => setTimeout(r, 7000))
        }
    } catch (error: any) {
        console.log(error.message)
        // console.log(error.stack)
        // await page.close()
        await browser.close()
    }

    await browser.close()
}

async function start() {

    const colors = [
        { title: 'Groupon', value: 'groupon' },
        { title: 'Yelp', value: 'yelp' }
    ]

    const selected = (items: any) => items
        .filter((item: any) => item.selected)
        .map((item: any) => item.value)

    // All these options are optional
    const opts = {
        cursor: 1,     // Initial position of the cursor, defaults to 0 (first entry)
        maxChoices: 3, // Maximum number of selectable options (defaults to Infinity)
        // The message to display as hint if enabled, below is the default value
        hint: '– Space to select. Return to submit.'
    }

    let sites;
    prompt('What websites are you running on?', colors, opts)
        .on('data', (data: any) => console.log('Changed to', selected(data.value)))
        .on('abort', (items: any) => console.log('Aborted with', selected(items)))
        .on('submit', async (items: any) => {
            for (const site of selected(items)) {
                try {
                    await Main(site).catch(e => console.log(e.message))
                } catch (error: any) {
                    console.log(error.message)
                    continue
                }
            }
        })
}

start()