import Module from '../wasm/tsp.js';

let tspModule = null;

Module().then((initializedModule) => {
  tspModule = initializedModule;
  console.log("Emscripten Module Initialized");

  self.addEventListener('message', (event) => {
    if (event.data.action === 'runTSP') {
      const numPoints = event.data.numPoints;
      try {
        const result = tspModule.runTSP(numPoints);
        self.postMessage({ action: 'tspResult', result: result });
      } catch (error) {
        console.error("Error running TSP:", error);
        self.postMessage({ action: 'tspError', message: error.message });
      }
    }
  });
});