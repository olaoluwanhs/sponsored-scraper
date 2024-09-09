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
const groupon_1 = __importDefault(require("./websites/groupon"));
const prompt = require('multiselect-prompt');
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
const term = process.argv[2];
function Main(sites) {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield puppeteer_extra_1.default.launch({
            headless: false,
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = (yield browser.pages())[0];
        yield page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                req.abort();
            }
            else {
                req.continue();
            }
        });
        // Conditional
        let targetSite;
        switch (sites) {
            case 'yelp':
                targetSite = new yelp_1.default(page, browser);
                break;
            case 'groupon':
                targetSite = new groupon_1.default(page, browser);
                break;
            default:
                console.log(`Unknown site`);
                // targetSite = new Groupon(page, browser)
                break;
        }
        if (!targetSite)
            return;
        // Process
        try {
            yield targetSite.navigate();
            yield targetSite.search(term);
            const sponsored = yield targetSite.fetchSponsored();
            for (let s of sponsored) {
                if (!s)
                    continue;
                yield targetSite.navigate(s, !s.startsWith('https'));
                const businessInfo = yield targetSite.getBusinessInformation();
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
        yield browser.close();
    });
}
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        const colors = [
            { title: 'Groupon', value: 'groupon' },
            { title: 'Yelp', value: 'yelp' }
        ];
        const selected = (items) => items
            .filter((item) => item.selected)
            .map((item) => item.value);
        // All these options are optional
        const opts = {
            cursor: 1, // Initial position of the cursor, defaults to 0 (first entry)
            maxChoices: 3, // Maximum number of selectable options (defaults to Infinity)
            // The message to display as hint if enabled, below is the default value
            hint: '– Space to select. Return to submit.'
        };
        let sites;
        prompt('What websites are you running on?', colors, opts)
            .on('data', (data) => console.log('Changed to', selected(data.value)))
            .on('abort', (items) => console.log('Aborted with', selected(items)))
            .on('submit', (items) => __awaiter(this, void 0, void 0, function* () {
            for (const site of selected(items)) {
                try {
                    yield Main(site).catch(e => console.log(e.message));
                }
                catch (error) {
                    console.log(error.message);
                    continue;
                }
            }
        }));
    });
}
start();
