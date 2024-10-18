import React from 'react';
import TspVisualization from './components/TspVisualization';
import CircleControl from './components/CircleControl';

const App = () => {
  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>React + WebAssembly + Web Workers</h1>
      <h2 style={{ textAlign: 'center' }}>Traveling Salesman Problem</h2>
       <div style={{ width: '90%', margin: '0 auto' }}>
        <p>
          This app uses a web worker along with WebAssembly (WASM) to perform computations for the Traveling Salesman Problem (TSP).
          By offloading the computational work to a separate thread using the web worker, the main thread remains unblocked, allowing
          the user to interact smoothly with the app, such as adjusting the circle size without any lag.
        </p>

        <div id="container" style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <TspVisualization />
          <CircleControl />
        </div>
      </div>
    </div>
  );
};

export default App;