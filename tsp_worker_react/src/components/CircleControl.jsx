import React, { useRef, useState, useEffect } from 'react';

const CircleControl = () => {
  const circleCanvasRef = useRef(null);
  const [diameter, setDiameter] = useState(100);

  const handleCircleChange = (e) => {
    const newDiameter = parseInt(e.target.value, 10);
    setDiameter(newDiameter);
    drawCircle(newDiameter);
  };

  const drawCircle = (diameter) => {
    const circleCanvas = circleCanvasRef.current;
    const circleCtx = circleCanvas.getContext('2d');
    circleCtx.clearRect(0, 0, circleCanvas.width, circleCanvas.height);
    circleCtx.beginPath();
    circleCtx.arc(100, 100, diameter / 2, 0, 2 * Math.PI);
    circleCtx.stroke();
  };

  useEffect(() => {
    drawCircle(diameter);
  }, [diameter]);

  return (
    <div>
      <canvas ref={circleCanvasRef} width={200} height={200} style={{ border: '1px solid black', backgroundColor: 'white' }}></canvas>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
        <label htmlFor="circleSlider">Circle Diameter (0-200): </label>
        <input
          type="range"
          id="circleSlider"
          min="0"
          max="200"
          value={diameter}
          onChange={handleCircleChange}
        />
        <div>Diameter: {diameter}</div>
      </div>
    </div>
  );
};

export default CircleControl;