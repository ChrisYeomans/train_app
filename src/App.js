/*jshint esversion: 8 */

import './App.css';
import { StationInfo } from './StationInfo.js';
import { StationList } from './StationList.js';
const React = require('react');


function App() {
  return (
    <div className="App">
      <header className="App-header">
          <StationList />
      </header>
    </div>
  );
}

export default App;
