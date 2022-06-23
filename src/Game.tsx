import React, { useState } from "react";

import Styles from "./Styles/Game.module.scss";

export const Game = () => {
  let [playerPosition, setPlayerPosition] = useState(0);

  const gameTiles = 3;

  const hasWon = playerPosition + 1 > gameTiles;

  function generateTiles(gameTiles: number) {
    const tiles = [];
    for (let gameTile = 0; gameTile < gameTiles; gameTile++) {
      tiles.push(
        <Tile
          playerHere={gameTile === playerPosition}
          key={gameTile}
          stage={gameTile}
        />
      );
    }
    return tiles;
  }

  return (
    <div className={Styles.gameGrid}>
      <section className={Styles.gameSection}>
        {generateTiles(gameTiles)}
      </section>
      <div className={Styles.buttonContainer}>
        <>
          {!hasWon && (
            <button onClick={() => setPlayerPosition(playerPosition + 1)}>
              Advance
            </button>
          )}
          {hasWon && (
            <button onClick={() => setPlayerPosition((playerPosition = 0))}>
              Reset Game
            </button>
          )}
        </>
      </div>
      <section className={Styles.statsSection}>
        {!hasWon && (
          <>
            <h2 className={Styles.statsHeader}>Stats </h2>
            <div className={Styles.statsBody}>
              <h3>Turn :</h3>
              <div className={Styles.statsContainer}>Stats...</div>
            </div>
          </>
        )}
        {hasWon && <WinScreen />}
      </section>
      <section className={Styles.userActionsSection}>
        <h2>User Actions</h2>
        <div className={Styles.buttonContainer}>
          <button>Attack</button>
        </div>
      </section>
    </div>
  );
};

const Tile = ({
  playerHere,
  stage,
}: {
  playerHere: boolean;
  stage: number;
}) => {
  return (
    <div
      className={`${Styles.tileContainer} ${playerHere ? Styles.fillTile : ""}`}
    >
      <h2>{`Stage: ${stage}`}</h2>
    </div>
  );
};

const WinScreen = () => {
  return <div className={Styles.hasWonContainer}>You win!</div>;
};
