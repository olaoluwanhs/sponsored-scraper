"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class Groupon {
    constructor(page, Browser) {
        this.page = page;
        this.browser = Browser;
        this.url = "https://groupon.com";
    }
    navigate() {
        return __awaiter(this, arguments, void 0, function* (url = this.url, is_route = false) {
            const link = is_route ? `${this.url}${url}` : url;
            console.log(link);
            yield this.page.goto(link, { timeout: 180000 });
        });
    }
    search(term) {
        return __awaiter(this, void 0, void 0, function* () {
            const searchInput = yield this.page.waitForSelector('#ls-search', { visible: true });
            yield (searchInput === null || searchInput === void 0 ? void 0 : searchInput.click());
            yield this.page.keyboard.type(term, { delay: 100 });
            yield new Promise(r => setTimeout(r, 3000)); //wait for a few seconds
            yield Promise.all([
                this.page.waitForFunction(`document.querySelector('.text-h1')?.innerHTML?.toLowerCase()?.includes('results for')`),
                this.page.keyboard.press('Enter')
            ]);
        });
    }
    fetchSponsored() {
        return __awaiter(this, void 0, void 0, function* () {
            // const sponsored = await this.page.waitForSelector(`::-p-xpath(//ul[contains(., 'Sponsored Results')])`, { visible: true })
            console.log('Sponsored posts');
            const sponsoredList = yield this.page.evaluate(() => {
                const listingCards = document.querySelectorAll("div[data-item-type='card'] a");
                if (!listingCards)
                    return [];
                return Array.from(listingCards).map(li => li.getAttribute('href'));
            });
            return sponsoredList;
        });
    }
    getBusinessInformation() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const contactInfo = {};
            const phoneNumberHead = yield this.page.$(`a[href*='tel:+']`);
            if (phoneNumberHead) {
                contactInfo.phoneNumber = yield ((_a = (yield (phoneNumberHead === null || phoneNumberHead === void 0 ? void 0 : phoneNumberHead.getProperty('href')))) === null || _a === void 0 ? void 0 : _a.jsonValue());
            }
            const companyWebsite = yield this.page.$(`::-p-xpath(//a[contains(text(), 'Company Website')])`);
            if (companyWebsite) {
                contactInfo.companyWebsite = (yield ((_b = (yield (companyWebsite === null || companyWebsite === void 0 ? void 0 : companyWebsite.getProperty('href')))) === null || _b === void 0 ? void 0 : _b.jsonValue()));
            }
            // $(`h1[data-testid="deal-title"]`).nextSibling.childNodes[0].innerText
            const businessName = yield this.page.evaluate(() => { var _a, _b; return (_b = (_a = document.querySelector(`h1[data-testid="deal-title"]`)) === null || _a === void 0 ? void 0 : _a.nextSibling) === null || _b === void 0 ? void 0 : _b.childNodes[0].textContent; });
            contactInfo.businessName = businessName;
            return contactInfo;
        });
    }
}
exports.default = Groupon;
