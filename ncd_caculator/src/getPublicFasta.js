export const getFastaList = async (idList) => {
    const copy = [...idList];
    const ids = copy.join(",");
    const FETCH_URI = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=nuccore&id=${ids}&rettype=fasta&retmode=text`;
    const fetchResponse = await fetch(FETCH_URI);
    if (!fetchResponse.ok) {
        throw new Error("Network response was not ok");
    }
    return await fetchResponse.text();
}

export const getFasta = (content) => {

}

export const getFastaAccessionNumbersFromIds = async (idList) => {
    idList = idList.join(",");
    const FETCH_URI = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=nucleotide&id=${idList}&rettype=acc`
    const fetchResponse = await fetch(FETCH_URI);
    if (!fetchResponse.ok) {
       throw new Error("Network response was not ok");
    }
    let accessions = await fetchResponse.text();
    if (accessions && accessions !== '') {
        return accessions.split("\n").filter(accession => accession != null);
    }
    return [];
}


export const getFastaIdsBySearchTerm = async (searchTerm, numItems) => {
    searchTerm = searchTerm.trim() + " AND mitochondrion[title] AND genome[title]";
    const ID_LIST_URI = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=nuccore&term=${searchTerm}&retmode=text&rettype=fasta&retmax=${numItems}`;
    let idList = [];
    const searchResponse = await fetch(ID_LIST_URI);
    if (!searchResponse.ok) {
        throw new Error("Network response was not ok");
    }

    const searchResult = await searchResponse.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(searchResult, "text/xml");

    idList = Array.from(xmlDoc.getElementsByTagName("Id")).map(
        (idNode) => idNode.textContent
    );
    if (idList.length === 0) {
        console.log("No IDs found for the search term.");
        return [];
    }
    return idList;
}


export const parseFasta = (fastaData) => {
    const labels = [];
    const contents = [];
    const lines = fastaData.split("\n");
    let currentLabel = null;
    let currentSequence = "";

    lines.forEach((line) => {
        if (line.startsWith(">")) {
            if (currentLabel && currentSequence) {
                labels.push(currentLabel);
                contents.push(currentSequence);
            }
            currentSequence = "";
            const header = line.substring(1);
            const labelMatch = header.match(/^(\S+)/);
            currentLabel = labelMatch ? labelMatch[1] : "Unknown";
        } else {
            currentSequence += line.trim();
        }
    });
    if (currentLabel && currentSequence) {
        labels.push(currentLabel);
        contents.push(currentSequence);
    }
    return { labels, contents };
};