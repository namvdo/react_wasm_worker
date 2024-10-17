import React from 'react';
import TspVisualization from './components/TspVisualization';
import CircleControl from './components/CircleControl';

const App = () => {
  return (
    <div id="container" style={{ display: 'flex', gap: '20px' }}>
      <TspVisualization />
      <CircleControl />
    </div>
  );
};

export default App;