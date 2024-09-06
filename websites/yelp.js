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
            yield this.page.goto(is_route ? `${this.url}${url}` : url, { timeout: 180000 });
        });
    }
    search(term) {
        return __awaiter(this, void 0, void 0, function* () {
            const searchInput = yield this.page.waitForSelector('#search_description', { visible: true });
            yield (searchInput === null || searchInput === void 0 ? void 0 : searchInput.click());
            yield this.page.keyboard.type(term, { delay: 100 });
            yield new Promise(r => setTimeout(r, 3000)); //wait for a few seconds
            yield this.page.keyboard.press('Enter');
            yield this.page.waitForNavigation();
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
}
exports.default = Yelp;
