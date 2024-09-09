import { Browser, Page } from "puppeteer";
import { BusinessInfo } from "../json-db";

export default class Groupon {
    page: Page;
    browser: Browser;
    url: string;
    constructor(page: Page, Browser: Browser) {
        this.page = page;
        this.browser = Browser;
        this.url = "https://groupon.com"
    }

    async navigate(url: string = this.url, is_route: boolean = false) {
        const link = is_route ? `${this.url}${url}` : url
        console.log(link)
        await this.page.goto(link, { timeout: 180000 });
    }

    async search(term: string) {
        const searchInput = await this.page.waitForSelector('#ls-search', { visible: true });
        await searchInput?.click();
        await this.page.keyboard.type(term, { delay: 100 })
        await new Promise(r => setTimeout(r, 3000)) //wait for a few seconds

        await Promise.all([
            this.page.waitForFunction(`document.querySelector('.text-h1')?.innerHTML?.toLowerCase()?.includes('results for')`),
            this.page.keyboard.press('Enter')
        ])
    }

    async fetchSponsored() {
        // const sponsored = await this.page.waitForSelector(`::-p-xpath(//ul[contains(., 'Sponsored Results')])`, { visible: true })

        console.log('Sponsored posts')

        const sponsoredList = await this.page.evaluate(() => {
            const listingCards = document.querySelectorAll("div[data-item-type='card'] a");
            if (!listingCards) return [];

            return Array.from(listingCards).map(li => li.getAttribute('href'));
        });

        return sponsoredList
    }

    async getBusinessInformation() {
        const contactInfo: BusinessInfo = {}

        const phoneNumberHead = await this.page.$(`a[href*='tel:+']`)
        if (phoneNumberHead) {
            contactInfo.phoneNumber = await (await phoneNumberHead?.getProperty('href'))?.jsonValue()
        }

        const companyWebsite = await this.page.$(`::-p-xpath(//a[contains(text(), 'Company Website')])`)
        if (companyWebsite) {
            contactInfo.companyWebsite = await (await companyWebsite?.getProperty('href'))?.jsonValue() as string
        }

        // $(`h1[data-testid="deal-title"]`).nextSibling.childNodes[0].innerText
        const businessName = await this.page.evaluate(() => document.querySelector(`h1[data-testid="deal-title"]`)?.nextSibling?.childNodes[0].textContent)
        contactInfo.businessName = businessName

        return contactInfo
    }

}