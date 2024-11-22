import React, { useEffect } from 'react';
import BusinessCalculator from './components/BusinessCalculator';
import './styles/custom.css';

function App() {
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--bg-image',
      `url(${process.env.PUBLIC_URL}/biz-acq-analyzer-background.png)`
    );
  }, []);

  return (
    <div className="min-h-screen">
      <BusinessCalculator />
    </div>
  );
}

export default App;