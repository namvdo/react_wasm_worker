import React, { useEffect, useRef, useState } from 'react';

const TspVisualization = () => {
  const tspCanvasRef = useRef(null);
  const [worker, setWorker] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [numPoints, setNumPoints] = useState(12);

  useEffect(() => {
    const createWorker = () => {
      const tspWorker = new Worker(new URL('../workers/tspWorker.js', import.meta.url), { type: 'module' });
      tspWorker.onmessage = (event) => {
        if (event.data.action === 'tspResult') {
          setIsRunning(false);
          tspCanvasRef.current.style.backgroundColor = 'white';
          clearCanvas();
          drawTspPath(JSON.parse(event.data.result), 'black');
        } else if (event.data.action === 'interimTSP') {
          clearCanvas();
          drawTspPath(JSON.parse(event.data.result), 'red');
        }
      };
      return tspWorker;
    };

    const tspWorker = createWorker();
    setWorker(tspWorker);

    return () => {
      tspWorker.terminate();
    };
  }, []);

  const clearCanvas = () => {
    const tspCanvas = tspCanvasRef.current;
    const tspCtx = tspCanvas.getContext('2d');
    tspCtx.clearRect(0, 0, tspCanvas.width, tspCanvas.height);
  };

  const drawTspPath = (points, color) => {
    const tspCanvas = tspCanvasRef.current;
    const tspCtx = tspCanvas.getContext('2d');
    tspCtx.strokeStyle = color;
    tspCtx.beginPath();
    tspCtx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      tspCtx.lineTo(points[i].x, points[i].y);
    }
    tspCtx.closePath();
    tspCtx.stroke();
  };

  const handleRunClick = () => {
    if (worker) {
      setIsRunning(true);
      tspCanvasRef.current.style.backgroundColor = 'black';
      worker.postMessage({ action: 'runTSP', numPoints });
    }
  };

  const handleStopClick = () => {
    if (worker) {
      worker.terminate();
      const newWorker = new Worker(new URL('../workers/tspWorker.js', import.meta.url), { type: 'module' });
      newWorker.onmessage = worker.onmessage;
      setWorker(newWorker);
      setIsRunning(false);
      tspCanvasRef.current.style.backgroundColor = 'white';
    }
  };

  return (
    <div>
      <canvas ref={tspCanvasRef} width={200} height={200} style={{ border: '1px solid black', backgroundColor: 'white' }}></canvas>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
        <label htmlFor="pointsSlider">Number of Points (2-15): </label>
        <input
          type="range"
          id="pointsSlider"
          min="2"
          max="15"
          value={numPoints}
          onChange={(e) => setNumPoints(e.target.value)}
        />
        <div>Points: {numPoints}</div>
        <button onClick={handleRunClick} disabled={isRunning}>Run TSP</button>
        <button onClick={handleStopClick} disabled={!isRunning}>Stop TSP</button>
      </div>
    </div>
  );
};

export default TspVisualization;
