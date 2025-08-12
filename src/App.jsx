import './App.css';
import { useEffect } from 'react';
import { setupEventHandlers } from './api/ui/EventHandlers.js';

function App() {

    useEffect(() => {
    setupEventHandlers();
  }, []);

  return (
    <div className='container'>
      <h2>ImpressoraFácil</h2>
      <textarea id="orderText" placeholder="Cole um pedido aqui..."></textarea>
      <button id="pasteBtn">Colar</button>
    </div>
  );
}

export default App
