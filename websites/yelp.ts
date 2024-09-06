import { Browser, Page } from "puppeteer";
import { BusinessInfo } from "../json-db";

export default class Yelp {
    page: Page;
    browser: Browser;
    url: string;
    constructor(page: Page, Browser: Browser) {
        this.page = page;
        this.browser = Browser;
        this.url = "https://yelp.com"
    }

    async navigate(url: string = this.url, is_route: boolean = false) {
        const link = is_route ? `${this.url}${url}` : url
        console.log(link)
        await this.page.goto(link, { timeout: 180000 });
    }

    async search(term: string) {
        const searchInput = await this.page.waitForSelector('#search_description', { visible: true });
        await searchInput?.click();
        await this.page.keyboard.type(term, { delay: 100 })
        await new Promise(r => setTimeout(r, 3000)) //wait for a few seconds

        await Promise.all([
            this.page.waitForNavigation({ timeout: 0 }),
            this.page.keyboard.press('Enter')
        ])
    }

    async fetchSponsored() {
        const sponsored = await this.page.waitForSelector(`::-p-xpath(//ul[contains(., 'Sponsored Results')])`, { visible: true })

        const sponsoredList = await this.page.evaluate(() => {
            const xpathResult = document.evaluate("//ul[contains(., 'Sponsored Results')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            const ulElement = xpathResult.singleNodeValue as HTMLUListElement;
            if (!ulElement) return [];

            // Select all the 'li' elements, slice them, and map to the hrefs
            const listItems: HTMLAnchorElement[] = Array.from(ulElement.querySelectorAll('a[href*="adredir?"] > img'));
            return listItems.map(li => (li.parentNode as HTMLAnchorElement).getAttribute('href'));
        });

        return sponsoredList
    }

    async getBusinessInformation() {
        const contactInfo: BusinessInfo = {}

        const phoneNumberHead = await this.page.waitForSelector(`::-p-xpath(//p[contains(text(), 'Phone number')]/following-sibling::*[1])`)
        contactInfo.phoneNumber = await (await phoneNumberHead?.getProperty('textContent'))?.jsonValue()

        const companyWebsite = await this.page.waitForSelector(`::-p-xpath(//p[contains(text(), 'Business website')]/following-sibling::*[1])`)
        contactInfo.companyWebsite = await (await companyWebsite?.getProperty('textContent'))?.jsonValue()

        const businessName = await this.page.waitForSelector(`h1`)
        contactInfo.businessName = await (await businessName?.getProperty('textContent'))?.jsonValue()

        return contactInfo
    }

}