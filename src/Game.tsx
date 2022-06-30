import React, { useState, useEffect } from "react";

import { generatePlayer } from "./PlayerAndMonsters/player";
import { generateMonster } from "./PlayerAndMonsters/monsters";

import Styles from "./Styles/Game.module.scss";
import { BattleWinner, Hitpoints, Monster, Player } from "./types";
import { sleep } from "./utils/utils";

export const Game = () => {
  const [player, setPlayer] = useState<Player>(generatePlayer());
  const [monster, setMonster] = useState<Monster>(generateMonster());
  const [stageWinner, setStageWinner] = useState<BattleWinner>("monster");
  const gameTiles = 3;
  const hasWon = player.position + 1 > gameTiles;

  let playerIsDead = player.hitpoints <= 0;

  // Each time the player enters a new stage, a new monster will be generated
  useEffect(() => {
    setMonster(generateMonster());
  }, [player.position]);

  return (
    <div className={Styles.gameGrid}>
      <section className={Styles.gameSection}>
        <Tile stage={player.position} />
      </section>

      <section className={Styles.statsSection}>
        {!hasWon && (
          <>
            <h2 className={Styles.statsHeader}>Stats </h2>
            <div className={Styles.statsBody}>
              <h3>Turn : Skeleton 3</h3>
              <div className={Styles.statsContainer}>
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
        {player.hitpoints <= 0 && <DeathScreen />}
        {(hasWon || player.hitpoints <= 0) && (
          <ResetGame
            setPlayer={setPlayer}
            setMonster={setMonster}
            setStageWinner={setStageWinner}
          />
        )}
      </section>
      <section className={Styles.logSection}>
        <h2 className={Styles.title}>Log</h2>
        <div className={Styles.description}></div>
      </section>
      <section className={Styles.userActionsSection}>
        <h2>Player: 'replace with player's name'</h2>
        <div className={Styles.buttonContainer}>
          <button
            className={`${Styles.btn} ${Styles.attack}`}
            onClick={async () => {
              setStageWinner(
                await doBattle({ player, monster, setPlayer, setMonster })
              );
            }}
            disabled={monster.hitpoints <= 0 || player.hitpoints <= 0 || hasWon}
          >
            Attack
          </button>
          <button className={`${Styles.btn} ${Styles.heal}`} disabled>
            Heal
          </button>

          {!hasWon && !playerIsDead && (
            <button
              onClick={() => {
                setPlayer({ ...player, position: player.position + 1 });
                setStageWinner("monster");
              }}
              className={`${Styles.btn} ${Styles.advance}`}
              disabled={stageWinner === "monster"}
            >
              Advance
            </button>
          )}

          {/* Run would work as an exit button in case the player wants to restart the game */}
          <button className={`${Styles.btn} ${Styles.run}`} disabled>
            Run
          </button>
        </div>
      </section>
    </div>
  );
};

const Tile = ({ stage }: { stage: number }) => {
  return (
    <div className={Styles.tileContainer}>
      <h2>{`Stage: ${stage}`}</h2>
    </div>
  );
};

const ResetGame = ({
  setPlayer,
  setMonster,
  setStageWinner,
}: {
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  setMonster: React.Dispatch<React.SetStateAction<Monster>>;
  setStageWinner: React.Dispatch<React.SetStateAction<BattleWinner>>;
}) => {
  return (
    <button
      onClick={() => {
        setPlayer(generatePlayer());
        setMonster(generateMonster());
        setStageWinner("monster");
      }}
      className={`${Styles.btn} ${Styles.reset}`}
    >
      Reset Game
    </button>
  );
};

const WinScreen = () => {
  return <div className={Styles.hasWonContainer}>You win!</div>;
};

const DeathScreen = () => {
  return <div className={Styles.hasWonContainer}>Monster win!</div>;
};

const doBattle = async ({
  player,
  monster,
  setPlayer,
  setMonster,
}: {
  player: Player;
  monster: Monster;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  setMonster: React.Dispatch<React.SetStateAction<Monster>>;
}): Promise<BattleWinner> => {
  let playerHitpoints = player.hitpoints;
  let monsterHitpoints = monster.hitpoints;

  let whoseAttacking = Math.random() * 1 >= 0.5 ? "monster" : "player";

  while (playerHitpoints >= 0 && monsterHitpoints >= 0) {
    if (whoseAttacking === "monster") {
      playerHitpoints -= monster.attackDamage;
      setPlayer({ ...player, hitpoints: playerHitpoints });
    } else {
      monsterHitpoints -= player.attackDamage;
      setMonster({ ...monster, hitpoints: monsterHitpoints });
    }
    whoseAttacking = whoseAttacking === "monster" ? "player" : "monster";

    await sleep(1000);
  }

  return playerHitpoints <= 0 ? "monster" : "player";
};

const VisualHitpoints = ({ name, value, maxValue }: Hitpoints) => {
  return (
    <div className={Styles.hitpointsContainer}>
      <h3 className={Styles.user}>{name}</h3>
      <progress
        className={`${Styles.progress} ${value <= 2 ? Styles.lowHealth : ""}`}
        value={value}
        max={maxValue}
      />
    </div>
  );
};
