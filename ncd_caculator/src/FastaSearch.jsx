import { useEffect, useState } from "react";
import { workerCode } from "./ncdWorker";
import { FileDrop } from "./FileDrop";
import MatrixTable from "./MatrixTable";

export const FastaSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [fastaData, setFastaData] = useState("");
  const [numItems, setNumItems] = useState(5);
  const [ncdMatrix, setNcdMatrix] = useState([]);
  const [labels, setLabels] = useState([]);
  const [hasMatrix, setHasMatrix] = useState(false);

  useEffect(() => {
    runNCDWorker();
  }, []);

  const handleFastaData = (data) => {
    setFastaData((prevFastaData) => [...prevFastaData, ...data]);
  };

  const blob = new Blob([workerCode], { type: "application/javascript" });
  const workerURL = URL.createObjectURL(blob);
  const worker = new Worker(workerURL);

  const displayNcdMatrix = (response) => {
    const { labels, ncdMatrix } = response;
    setLabels(labels);
    setNcdMatrix(ncdMatrix);
    setHasMatrix(true);
  };

  const runNCDWorker = () => {
    worker.onmessage = function (e) {
      const message = e.data;
      console.log("got message: " + JSON.stringify(message));
      if (message.type === "progress") {
        console.log("get process message: " + JSON.stringify(message));
      } else if (message.type === "result") {
        console.log("message result: " + JSON.stringify(message));
        displayNcdMatrix(message);
      }
    };
  };

  const parseFasta = (fastaData) => {
    const labels = [];
    const contents = [];
    console.log("fasta data: PPPPP " + JSON.stringify(fastaData));
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

  const fetchFastaList = async (searchTerm) => {
    console.log("Searching for: " + searchTerm);

    if (!searchTerm) return;

    searchTerm =
      searchTerm.trim() + " AND mitochondrion[title] AND genome[title]";

    const ID_LIST_URI = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=nuccore&term=${encodeURIComponent(
      searchTerm
    )}&retmode=text&rettype=fasta&retmax=${numItems}`;

    try {
      const searchResponse = await fetch(ID_LIST_URI);
      if (!searchResponse.ok) {
        throw new Error("Network response was not ok");
      }

      const searchResult = await searchResponse.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(searchResult, "text/xml");

      const idList = Array.from(xmlDoc.getElementsByTagName("Id")).map(
        (idNode) => idNode.textContent
      );
      if (idList.length === 0) {
        console.log("No IDs found for the search term.");
        return;
      }

      const ids = idList.join(",");
      const FETCH_URI = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=nuccore&id=${ids}&rettype=fasta&retmode=text`;

      const fetchResponse = await fetch(FETCH_URI);
      if (!fetchResponse.ok) {
        throw new Error("Network response was not ok");
      }

      const fastaData = await fetchResponse.text();
      setFastaData(fastaData);
      setNcdMatrix([]);
      setLabels([]);
      setHasMatrix(false);
      return fastaData;
    } catch (error) {
      console.error("Fetch error: ", error);
    }
  };

  const handleSearch = async (currentSearchTerm) => {
    if (!currentSearchTerm) {
      currentSearchTerm = searchTerm;
    }
    console.log("search term now: " + currentSearchTerm);
    const fastaList = await fetchFastaList(currentSearchTerm);
    if (fastaList) {
      const parsedFastaList = parseFasta(fastaList);
      console.log("post fasta raw to the worker: " + fastaData);
      console.log("post fasta messags to the worker: " + parsedFastaList);

      if (parsedFastaList.labels.length > 0 && parsedFastaList.contents.length > 0) {
        worker.postMessage({
          labels: parsedFastaList.labels,
          contents: parsedFastaList.contents,
        });
      }
    }
  };

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div style={{ margin: "20px", textAlign: "center" }}>
      <h1 style={{ marginBottom: "20px" }}>NCD Calculator</h1>
      <div>
        <input
          type="text"
          placeholder="Enter search terms, e.g. buffalo"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            padding: "10px",
            width: "300px",
            fontSize: "18px",
            border: "2px solid #4CAF50",
            borderRadius: "5px",
            outline: "none",
            transition: "border-color 0.3s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#66bb6a")}
          onBlur={(e) => (e.target.style.borderColor = "#4CAF50")}
        />
        <select
          value={numItems}
          onChange={(e) => setNumItems(e.target.value)}
          style={{
            padding: "10px",
            marginLeft: "10px",
            fontSize: "18px",
            border: "2px solid #4CAF50",
            borderRadius: "5px",
          }}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="15">15</option>
          <option value="20">20</option>
        </select>
        <button
          onClick={() => handleSearch(searchTerm)}
          style={{
            padding: "10px 20px",
            fontSize: "18px",
            marginLeft: "10px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            transition: "background-color 0.3s",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#45a049")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#4CAF50")}
        >
          Search
        </button>
      </div>
      <div>
        <FileDrop onFastaData={handleFastaData} />
      </div>
      <div
        style={{
          marginTop: "20px",
          textAlign: "left",
          whiteSpace: "pre-wrap",
          maxHeight: "300px",
          overflowY: "auto",
          border: "1px solid #ccc",
          borderRadius: "5px",
          padding: "10px",
        }}
      >
        <h2>FASTA Results:</h2>
        <pre>{fastaData || "No results to display."}</pre>
      </div>
      <div style={{ marginTop: "20px", textAlign: "left" }}>
        {hasMatrix && (
          <div style={{ overflowX: "auto", maxWidth: "100%" }}>
            <MatrixTable ncdMatrix={ncdMatrix} labels={labels} />
          </div>
        )}
      </div>
    </div>
  );
};
