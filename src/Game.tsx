import React, { useState, useEffect } from "react";

import { generatePlayer } from "./PlayerAndMonsters/player";
import { generateMonster } from "./PlayerAndMonsters/monsters";

import Styles from "./Styles/Game.module.scss";
import { BattleWinner, Hitpoints, Monster, Player } from "./types";
import { sleep } from "./utils/utils";

export const Game = () => {
  const [player, setPlayer] = useState<Player>(generatePlayer());
  const [monster, setMonster] = useState<Monster>(generateMonster());

  // Adding the initial max life points
  const { hitpoints: maxPlayerLife } = generatePlayer();
  const { hitpoints: maxMonsterLife } = generateMonster();

  const [logMessage, setLogMessage] = useState<string[]>([]);
  const [stageWinner, setStageWinner] = useState<BattleWinner>("monster");
  const gameTiles = 3;
  const hasWon = player.position + 1 > gameTiles;

  let playerIsDead = player.hitpoints <= 0;

  // Each time the player enters a new stage, a new monster will be generated
  useEffect(() => {
    setMonster(generateMonster());
  }, [player.position]);

  const handleMessages = (message: string) => {
    const dateTime = new Date().toLocaleTimeString();
    return logMessage.unshift(`${dateTime} ${message}`);
  };

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
              <div className={Styles.statsContainer}>
                <VisualHitpoints
                  name={"player"}
                  value={player.hitpoints}
                  maxValue={maxPlayerLife}
                />
                <VisualHitpoints
                  name={"monster"}
                  value={monster.hitpoints}
                  maxValue={maxMonsterLife}
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
            setLogMessage={setLogMessage}
          />
        )}
      </section>
      <section className={Styles.logSection}>
        <h2 className={Styles.title}>Log</h2>
        <div className={Styles.description}>
          {logMessage.map((msg, i) => (
            <div className={Styles.logMessage} key={i}>
              {msg}
            </div>
          ))}
        </div>
      </section>
      <section className={Styles.userActionsSection}>
        <h2>Player</h2>
        <div className={Styles.buttonContainer}>
          <button
            className={`${Styles.btn} ${Styles.attack}`}
            onClick={async () => {
              const winner = await doBattle({
                player,
                monster,
                setPlayer,
                setMonster,
                handleMessages,
              });
              setStageWinner(winner);
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
                handleMessages(
                  player.position === 2
                    ? "player win!"
                    : `player changed to stage ${player.position + 1}`
                );
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
  setLogMessage,
}: {
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  setMonster: React.Dispatch<React.SetStateAction<Monster>>;
  setStageWinner: React.Dispatch<React.SetStateAction<BattleWinner>>;
  setLogMessage: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  return (
    <button
      onClick={() => {
        setPlayer(generatePlayer());
        setMonster(generateMonster());
        setStageWinner("monster");
        setLogMessage([]);
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
  handleMessages,
}: {
  player: Player;
  monster: Monster;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  setMonster: React.Dispatch<React.SetStateAction<Monster>>;
  handleMessages: (message: string) => number;
}): Promise<BattleWinner> => {
  let playerHitpoints = player.hitpoints;
  let monsterHitpoints = monster.hitpoints;

  let firstAttacking = Math.random() * 1 >= 0.5 ? "monster" : "player";
  handleMessages(`first attacking: ${firstAttacking}`);

  while (playerHitpoints >= 0 && monsterHitpoints >= 0) {
    if (firstAttacking === "monster") {
      playerHitpoints -= monster.attackDamage;
      setPlayer({ ...player, hitpoints: playerHitpoints });
      handleMessages(
        playerHitpoints >= 0
          ? `${firstAttacking === "monster" ? "player" : "monster"} loose ${
              monster.attackDamage
            } hitpoints due to an attack by a ${firstAttacking}`
          : `${
              firstAttacking === "monster" ? "player" : "monster"
            } was killed by a ${firstAttacking}`
      );
    } else {
      monsterHitpoints -= player.attackDamage;
      setMonster({ ...monster, hitpoints: monsterHitpoints });
      handleMessages(
        monsterHitpoints >= 0
          ? `${firstAttacking === "monster" ? "player" : "monster"} loose ${
              player.attackDamage
            } hitpoints due to an attack by a ${firstAttacking}`
          : `${
              firstAttacking === "monster" ? "player" : "monster"
            } was killed by a ${firstAttacking}`
      );
    }
    firstAttacking = firstAttacking === "monster" ? "player" : "monster";

    await sleep(1000);
  }

  return playerHitpoints <= 0 ? "monster" : "player";
};

const VisualHitpoints = ({ name, value, maxValue }: Hitpoints) => {
  return (
    <div className={Styles.hitpointsContainer}>
      <h3 className={Styles.user}>{name}</h3>
      <progress
        className={`${Styles.progress} ${value <= 4 ? Styles.lowHealth : ""} ${
          value <= 2 ? Styles.aboutToDie : ""
        }`}
        value={value}
        max={maxValue}
      />
    </div>
  );
};
