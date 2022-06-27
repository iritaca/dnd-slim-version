import React, { useState, useEffect } from "react";

import { generatePlayer } from "./PlayerAndMonsters/player";
import { generateMonster } from "./PlayerAndMonsters/monsters";

import Styles from "./Styles/Game.module.scss";
import { BattleWinner, Monster, Player } from "./types";

export const Game = () => {
  const [player, setPlayer] = useState<Player>(generatePlayer());
  const gameTiles = 3;
  const hasWon = player.position + 1 > gameTiles;

  function generateTiles(gameTiles: number) {
    const tiles = [];
    for (let gameTile = 0; gameTile < gameTiles; gameTile++) {
      tiles.push(
        <Tile
          player={player}
          setPlayer={setPlayer}
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
            <button
              onClick={() =>
                setPlayer({ ...player, position: player.position + 1 })
              }
            >
              Advance
            </button>
          )}
          {hasWon && (
            <button onClick={() => setPlayer({ ...player, position: 0 })}>
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
  player,
  setPlayer,
  stage,
}: {
  player: { hitpoints: number; attackDamage: number; position: number };
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  stage: number;
}) => {
  const [monster, setMonster] = useState<Monster>(generateMonster());

  const playerIsHere = player.position === stage;

  useEffect(() => {
    if (playerIsHere) {
      const winner = doBattle({ player, monster, setPlayer, setMonster });
      console.log(winner);
    }
  }, [playerIsHere]);

  return (
    <div
      className={`${Styles.tileContainer}  ${
        playerIsHere ? Styles.fillTile : ""
      }`}
    >
      <h2>{`Stage: ${stage}`}</h2>
    </div>
  );
};

const WinScreen = () => {
  return <div className={Styles.hasWonContainer}>You win!</div>;
};

const doBattle = ({
  player,
  monster,
  setPlayer,
  setMonster,
}: {
  player: Player;
  monster: Monster;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  setMonster: React.Dispatch<React.SetStateAction<Monster>>;
}): BattleWinner => {
  let playerHitpoints = player.hitpoints;
  let monsterHitpoints = monster.hitpoints;

  // loop

  // player attack
  // playerHitpoints -= monster.attackDamage

  // monster attack
  // monsterHitpoints -= player.attackDamage

  // \loop -> breaks if playerHitpoints <= 0 OR monsterHitpoints <= 0

  // Update state after loop calculations
  setPlayer({ ...player, hitpoints: playerHitpoints });
  setMonster({ ...monster, hitpoints: monsterHitpoints });

  return playerHitpoints <= 0 ? "monster" : "player";
};
