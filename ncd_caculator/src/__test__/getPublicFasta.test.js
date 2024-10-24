/* eslint-disable */
import {test, expect, assert} from "vitest";
import {
    getApiResponse,
    getFastaAccessionNumbersFromIds, getFastaAccessionNumbersFromIdsUri,
    getFastaIdsBySearchTerm,
    getFastaIdsBySearchTermUri,
    getFastaList,
    getFastaListUri,
    parseFasta
} from "../getPublicFasta.js";
import { Parser } from "xml2js"
import { fsync, writeFile } from "fs";
import { parseAccessionNumber } from "../cache.js";
const parser = new Parser();


test('test fetch IDs by term', async () => {
    const idsUri = await getFastaIdsBySearchTermUri("buffalo", 20);
    const response = await getApiResponse(idsUri);
    const json = await parser.parseStringPromise(response);
    const structure = {
        id: "id",
        accessionNumber: "accessionNumber",
        searchTerm: "searchTerm",
        sequence: "sequence",
    }
    console.log("thing: " + JSON.stringify(json));
    const ids = json["eSearchResult"]["IdList"][0]["Id"];
    const accessionNumbers = (await getApiResponse(getFastaAccessionNumbersFromIdsUri(ids))).trim().split("\n").map(parseAccessionNumber);
    const sequence = await getFastaListUri(ids);
    const sequenceResponse = await getApiResponse(sequence);
   const parsedFasta =  parseFasta(sequenceResponse);
   const data = [];
   for(let i = 0; i < ids.length; i++ ) {
    const obj = {
        "id": ids[i],
        "accessionNumber": accessionNumbers[i],
        "searchTerm": "buffalo",
        "sequence": parsedFasta["contents"][i].toLowerCase().trim()
    }
    data.push(obj);
   }
   for (let thing of data) {
    let x = thing.sequence.split("").filter(x => !"ATGC".includes(x)).length;
    expect(x.length === 0)
   }
})