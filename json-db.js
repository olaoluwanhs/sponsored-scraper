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
exports.writeObject = void 0;
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const JSON_FILE_NAME = './database.json';
const writeObject = (obj) => __awaiter(void 0, void 0, void 0, function* () {
    let text = !(0, fs_1.existsSync)(JSON_FILE_NAME) ? "[]" : (yield (0, promises_1.readFile)(JSON_FILE_NAME)).toString();
    let json;
    try {
        json = JSON.parse(text);
    }
    catch (error) {
        json = [];
    }
    json.push(obj);
    yield (0, promises_1.writeFile)(JSON_FILE_NAME, JSON.stringify(json));
    console.log("Saved ", obj, "to", JSON_FILE_NAME);
});
exports.writeObject = writeObject;
