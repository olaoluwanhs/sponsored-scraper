import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises'

const JSON_FILE_NAME = './database.json';

export type BusinessInfo = {
    phoneNumber?: string | null,
    businessName?: string | null,
    companyWebsite?: string | null
}

export const writeObject = async (obj: BusinessInfo) => {
    let text = !existsSync(JSON_FILE_NAME) ? "[]" : (await readFile(JSON_FILE_NAME)).toString();
    let json;
    try {
        json = JSON.parse(text)
    } catch (error) {
        json = []
    }

    json.push(obj)
    await writeFile(JSON_FILE_NAME, JSON.stringify(json))
    console.log("Saved ", obj, "to", JSON_FILE_NAME)
}