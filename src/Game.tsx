import React, { useState, useEffect } from "react";

import { generatePlayer } from "./PlayerAndMonsters/player";
import { generateMonster } from "./PlayerAndMonsters/monsters";

import Styles from "./Styles/Game.module.scss";
import { BattleWinner, Hitpoints, Monster, Player } from "./types";

export const Game = () => {
  const [player, setPlayer] = useState<Player>(generatePlayer());
  const gameTiles = 3;
  const hasWon = player.position + 1 > gameTiles;

  const [monster, setMonster] = useState<Monster>(generateMonster());

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

      <section className={Styles.statsSection}>
        {!hasWon && (
          <>
            <h2 className={Styles.statsHeader}>Stats </h2>
            <div className={Styles.statsBody}>
              <h3>Turn : Skeleton 3</h3>
              <div className={Styles.statsContainer}>
                {/* I'd like to add here an array filled by the players and monster names */}
                <VisualHitpoints
                  name={"player"}
                  value={player.hitpoints}
                  // @Ro: how could we store the initial hitpoints and not the updated value?
                  maxValue={20}
                />
                <VisualHitpoints
                  name={"monster"}
                  value={monster.hitpoints}
                  maxValue={13}
                />
              </div>
            </div>
          </>
        )}
        {hasWon && <WinScreen />}
      </section>
      <section className={Styles.logSection}>
        <h2 className={Styles.title}>Log</h2>
        <div className={Styles.description}></div>
      </section>
      <section className={Styles.userActionsSection}>
        <h2>Player: 'player's name'</h2>
        <div className={Styles.buttonContainer}>
          <button className={`${Styles.btn} ${Styles.attack}`}>Attack</button>
          <button className={`${Styles.btn} ${Styles.heal}`}>Heal</button>
          <>
            {!hasWon && (
              <button
                onClick={() => {
                  setPlayer({ ...player, position: player.position + 1 });
                  // winner = doBattle({ player, monster, setPlayer, setMonster });
                }}
                className={`${Styles.btn} ${Styles.advance}`}
              >
                Advance
              </button>
            )}
            {hasWon && (
              <button
                onClick={() => setPlayer({ ...player, position: 0 })}
                className={`${Styles.btn} ${Styles.reset}`}
              >
                Reset Game
              </button>
            )}
          </>
          {/* Run would work as an exit button in case the player want to restart the game */}
          <button className={`${Styles.btn} ${Styles.run}`}>Run</button>
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

  let whoseAttacking = Math.random() * 1 >= 0.5 ? "monster" : "player";

  while (playerHitpoints >= 0 && monsterHitpoints >= 0) {
    if (whoseAttacking === "monster") {
      playerHitpoints -= monster.attackDamage;
    } else {
      monsterHitpoints -= player.attackDamage;
    }
    whoseAttacking = whoseAttacking === "monster" ? "player" : "monster";
  }

  // Update state after loop calculations
  setPlayer({ ...player, hitpoints: playerHitpoints });
  setMonster({ ...monster, hitpoints: monsterHitpoints });
  console.log(playerHitpoints);
  return playerHitpoints <= 0 ? "monster" : "player";
};

const VisualHitpoints = ({ name, value, maxValue }: Hitpoints) => {
  return (
    <div className={Styles.hitpointsContainer}>
      <h3 className={Styles.user}>{name}</h3>
      <progress className={Styles.progress} value={value} max={maxValue} />
    </div>
  );
};
