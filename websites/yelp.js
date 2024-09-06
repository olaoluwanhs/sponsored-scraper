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
class Yelp {
    constructor(page, Browser) {
        this.page = page;
        this.browser = Browser;
        this.url = "https://yelp.com";
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
            const searchInput = yield this.page.waitForSelector('#search_description', { visible: true });
            yield (searchInput === null || searchInput === void 0 ? void 0 : searchInput.click());
            yield this.page.keyboard.type(term, { delay: 100 });
            yield new Promise(r => setTimeout(r, 3000)); //wait for a few seconds
            yield Promise.all([
                this.page.waitForNavigation({ timeout: 0 }),
                this.page.keyboard.press('Enter')
            ]);
        });
    }
    fetchSponsored() {
        return __awaiter(this, void 0, void 0, function* () {
            const sponsored = yield this.page.waitForSelector(`::-p-xpath(//ul[contains(., 'Sponsored Results')])`, { visible: true });
            const sponsoredList = yield this.page.evaluate(() => {
                const xpathResult = document.evaluate("//ul[contains(., 'Sponsored Results')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                const ulElement = xpathResult.singleNodeValue;
                if (!ulElement)
                    return [];
                // Select all the 'li' elements, slice them, and map to the hrefs
                const listItems = Array.from(ulElement.querySelectorAll('a[href*="adredir?"] > img'));
                return listItems.map(li => li.parentNode.getAttribute('href'));
            });
            return sponsoredList;
        });
    }
    getBusinessInformation() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const contactInfo = {};
            const phoneNumberHead = yield this.page.waitForSelector(`::-p-xpath(//p[contains(text(), 'Phone number')]/following-sibling::*[1])`);
            contactInfo.phoneNumber = yield ((_a = (yield (phoneNumberHead === null || phoneNumberHead === void 0 ? void 0 : phoneNumberHead.getProperty('textContent')))) === null || _a === void 0 ? void 0 : _a.jsonValue());
            const companyWebsite = yield this.page.waitForSelector(`::-p-xpath(//p[contains(text(), 'Business website')]/following-sibling::*[1])`);
            contactInfo.companyWebsite = yield ((_b = (yield (companyWebsite === null || companyWebsite === void 0 ? void 0 : companyWebsite.getProperty('textContent')))) === null || _b === void 0 ? void 0 : _b.jsonValue());
            const businessName = yield this.page.waitForSelector(`h1`);
            contactInfo.businessName = yield ((_c = (yield (businessName === null || businessName === void 0 ? void 0 : businessName.getProperty('textContent')))) === null || _c === void 0 ? void 0 : _c.jsonValue());
            return contactInfo;
        });
    }
}
exports.default = Yelp;
