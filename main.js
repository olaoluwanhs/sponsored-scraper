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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const yelp_1 = __importDefault(require("./websites/yelp"));
const json_db_1 = require("./json-db");
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
function Main() {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield puppeteer_extra_1.default.launch({
            headless: false,
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = (yield browser.pages())[0];
        // Conditional
        let targetSite;
        switch (null) {
            default:
                targetSite = new yelp_1.default(page, browser);
                break;
        }
        // Process
        try {
            yield targetSite.navigate();
            yield targetSite.search("Shoe");
            const sponsored = yield targetSite.fetchSponsored();
            console.log(sponsored);
            for (let s of sponsored) {
                if (!s)
                    continue;
                yield targetSite.navigate(s, true);
                const businessInfo = yield targetSite.getBusinessInformation();
                // console.log(businessInfo)
                yield (0, json_db_1.writeObject)(businessInfo);
                yield new Promise(r => setTimeout(r, 7000));
            }
        }
        catch (error) {
            console.log(error.message);
            // console.log(error.stack)
            // await page.close()
            yield browser.close();
        }
        // await page.close()
        yield browser.close();
    });
}
Main().catch(e => console.log(e.message));
