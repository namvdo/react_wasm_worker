/* eslint-disable */
import {test, expect, assert} from "vitest";
import {
    getApiResponse,
    getFastaAccessionNumbersFromIds, getFastaAccessionNumbersFromIdsUri,
    getFastaIdsBySearchTermUri,
    getFastaList,
    getFastaListUri,
    parseFasta
} from "../functions/getPublicFasta.js";
import {Parser} from "xml2js"
import {readFileSync, writeFile} from "fs";

import {parseAccessionNumber} from "../functions/cache.js";
import {join} from "node:path";
import * as path from "node:path";

const parser = new Parser([]);
const searchTerm = "buffalo";
const listSize = 20;

const getSampleFasta = () => {
    return readFileSync(join(__dirname, "buffaloes_fasta.json"), 'utf-8');
}

const SAMPLE_FASTA = JSON.parse(getSampleFasta());
const IDS = SAMPLE_FASTA.map(json => json.id);
const ACCESSIONS = SAMPLE_FASTA.map(json => json.acessionNumbers);
const SEQUENCES = SAMPLE_FASTA.map(json => json.sequence);

test('test fetch fasta IDs for buffalo', async () => {
    const idsUri = await fetchWithRetry(getFastaIdsBySearchTermUri, searchTerm, listSize);
    const response = await fetchWithRetry(getApiResponse, idsUri);
    const json = await parser.parseStringPromise(response);
    const ids = json["eSearchResult"]["IdList"][0]["Id"];
    expect(ids.length === 20);
    expect(arraysEqual(ids, IDS));
})

test('test fetch accessions numbers from fasta IDs', async () => {
    let fastaAccessionNumbersFromIdsUri = await fetchWithRetry(getFastaAccessionNumbersFromIdsUri, IDS);
    let textResponse = await fetchWithRetry(getApiResponse, fastaAccessionNumbersFromIdsUri)
    const accessionNumbers = textResponse.trim().split("\n").map(parseAccessionNumber);
    expect(arraysEqual(accessionNumbers, ACCESSIONS));
});


test('test fetch sequence responses from fasta IDs', async () => {
    const fastaListUri = await getFastaListUri(IDS);
    const sequenceResponse = await fetchWithRetry(getApiResponse, fastaListUri);
    let parsed = parseFasta(sequenceResponse);
    expect(arraysEqual(parsed.contents, SEQUENCES));
});

test('test fetch fasta list from search term', async () => {
    let uri = await fetchWithRetry(getFastaIdsBySearchTermUri, searchTerm, listSize);
    let ids = (await fetchWithRetry(getApiResponse, uri)).split(",");
    expect(arraysEqual(ids, IDS));
    let accessionUris = await fetchWithRetry(getFastaAccessionNumbersFromIds, ids);
    expect(arraysEqual(accessionUris, ACCESSIONS));
    let fastaList = await fetchWithRetry(getFastaList, ids);
    let parsed = parseFasta(fastaList);
    expect(arraysEqual(parsed.contents, SEQUENCES));
})


const arraysEqual = (a, b) => {
    let setA = new Set(a);
    let setB = new Set(b);
    if (setA.size !== setB.size) {
        return false;
    }
    for (let item of setA) {
        if (!setB.has(item)) {
            return false;
        }
    }
    return true;
}

const delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


const retries = 5;
const delayMs = 1000;

async function fetchWithRetry(func,...params) {
    for (let i = 0; i < retries; i++) {
        let response;
        try {
            if (params.length === 1) {
                response = await func(params[0]);
            } else {
                response = await func(params[0], params[1]);
            }
            if (response && response.length !== 0) {
                return response;
            } else {
                if (i < retries - 1) {
                    console.log(`Attempt ${i + 1} failed. Retrying in 1 seconds...`);
                    await delay(delayMs);
                } else {
                    console.log('All retries failed.');
                    return null;
                }
            }
        } catch (error) {
            if (i < retries - 1) {
                console.log(`Attempt ${i + 1} failed. Retrying in 1 seconds...`);
                await delay(delayMs);
            } else {
                console.log('All retries failed.');
                return null;
            }
        }
    }
}