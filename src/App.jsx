import './App.css';
import { useEffect } from 'react';
import { setupEventHandlers } from './api/ui/EventHandlers.js';

function App() {

    useEffect(() => {
    setupEventHandlers();
  }, []);

  return (
    <div className='container'>
      <h2>EasyPrint</h2>
      <textarea id="orderText" placeholder="Paste the order here..."></textarea>
      <button id="pasteBtn">Paste</button>
    </div>
  );
}

export default App
