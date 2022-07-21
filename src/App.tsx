import React from "react";
import { Game } from "./Game";
import { GameInfo } from "./GameInfo";
import { Home } from "./Home";
import { NotFound } from "./NotFound";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  BrowserRouter,
  Outlet,
} from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/game-info" element={<GameInfo />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
