import React, { useState, useEffect, useRef } from "react";
import "./App.css";
function App() {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [cells, setCells] = useState([]);
  const [grid, setGrid] = useState([]);
  const [day, setDay] = useState(0);
  const [lastDayCross, setLastDayCross] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [autoPlay, setAutoPlay] = useState(false);
  const intervalRef = useRef(null);
  const [randomFlood, setRandomFlood] = useState(false);
  useEffect(() => {
    applyGridSize(); // build grid initially
  }, []);
  // Build a new grid with current rows/cols/randomFlood
  const applyGridSize = () => {
    setDay(0);
    setLastDayCross(0);
    const newGrid = Array.from({ length: rows }, () => Array(cols).fill(0));
    setGrid(newGrid);
    let newCells = [];
    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        newCells.push([r, c]);
      }
    }
    // shuffele cells if randomFlood is true
    if (randomFlood) {
      for (let i = newCells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newCells[i], newCells[j]] = [newCells[j], newCells[i]];
      }
    }
    setCells(newCells);
  };
  // Reset only simulation progress, keep same grid
  const resetOnly = () => {
    setDay(0);
    setLastDayCross(0);
    setGrid((prev) => prev.map((row) => [...row])); // keep same grid
  };
  const floodCell = (r, c) => {
    setGrid((prev) => {
      const newGrid = prev.map((row) => [...row]);
      newGrid[r - 1][c - 1] = 1;
      return newGrid;
    });
  };
  const bfs = () => {
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const q = [];
    for (let c = 0; c < cols; c++) {
      if (grid[0][c] === 0) {
        q.push([0, c]);
        visited[0][c] = true;
      }
    }
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    const path = [];
    while (q.length) {
      const [r, c] = q.shift();
      path.push([r, c]);
      if (r === rows - 1) return path;
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr>=0 && nr<rows && nc>=0 && nc<cols && !visited[nr][nc] && grid[nr][nc]===0) {
          visited[nr][nc] = true;
          q.push([nr,nc]);
        }
      }
    }
    return [];
  };
  const nextDay = () => {
    if (day < cells.length) {
      const [r, c] = cells[day];
      floodCell(r, c);
      const newDay = day + 1;
      setDay(newDay);
      const path = bfs();
      if (path.length) setLastDayCross(newDay);
    } else {
      setAutoPlay(false);
    }
  };
  useEffect(() => {
    if (autoPlay) {
      intervalRef.current = setInterval(nextDay, speed);
      return () => clearInterval(intervalRef.current);
    }
  }, [autoPlay, speed, day]);
  return (
    <div className={darkMode ? "dark-mode" : "light-mode"}>
      <header className="app-header">
        <h2>🌊 Last Day Where You Can Still Cross</h2>
        {/* Floating Theme Toggle Button */}
        <div className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? (
            <span role="img" aria-label="moon">🌙</span>
          ) : (
            <span role="img" aria-label="sun">☀️</span>
          )}
        </div>
      </header>
      <div className="controls">
        <label>
          Rows:
          <input type="number" value={rows} min="2" max="20"
            onChange={(e) => setRows(parseInt(e.target.value))}/>
        </label>
        <label>
          Cols:
          <input type="number" value={cols} min="2" max="20"
            onChange={(e) => setCols(parseInt(e.target.value))}/>
        </label>
        <label>
          <input type="checkbox" checked={randomFlood}
            onChange={(e) => setRandomFlood(e.target.checked)}/>
          Random Flooding
        </label>
        {/* <button onClick={applyGridSize}>Apply Grid Size</button> */}
      </div>
      <div className="grid"
        style={{display:"grid",gridTemplateColumns:`repeat(${cols},30px)`,margin:"20px auto",gap:"2px"}}>
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <div key={`${r}-${c}`} className={`cell ${cell === 1 ? "water" : "land"}`}></div>
          ))
        )}
      </div>
      <div className="buttons">
        <button onClick={nextDay}>Next Day</button>
        <button onClick={resetOnly}>Reset</button>
        <button onClick={() => setAutoPlay(true)}>▶ Auto Play</button>
        <button onClick={() => setAutoPlay(false)}>⏸ Pause</button>
        <button onClick={applyGridSize}>Apply Grid Size</button>
      </div>
      <div className="slider">
        <label>
          ⏱ Speed:
          <input type="range" min="200" max="2000" step="100" value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value))}/>
          <span>{speed} ms</span>
        </label>
      </div>
      <div>
        <p className="day-status">
          Day {day}: {day === 0 ? "All land 🌱" : "Simulation running..."}
        </p>
        <p className="last-day">
          Last Day You Can Cross: {lastDayCross}
        </p>
      </div>
    </div>
  );
}
export default App;

