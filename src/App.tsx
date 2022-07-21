import React from "react";
import { Game } from "./Game";
import { GameInfo } from "./GameInfo";
import { Home } from "./Home";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/game" element={<Game />} />
          <Route path="/game-info" element={<GameInfo />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
