import './App.css';
import { StationList } from './StationList.js';
import { RoutePlanner } from './RoutePlanner.js';
const React = require('react');


function App() {
  return (
    <div className="App">
      <header className="App-header">

      </header>
        <div class ="banner"><img src="snooShad.png" alt="Logo" style={{height:"260px"}} /><span class= "titles1">IRISH ROUTE PLANNER</span></div>

        <div class ="app" style={{overflow:"auto"}}><span class= "titles2">Live Station</span><StationList /></div>
        <div class ="app" style={{overflow:"auto"}}><span class= "titles2">Route Planner</span><RoutePlanner /></div>
    </div>
  );
}

export default App;