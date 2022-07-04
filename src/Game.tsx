import React, { useState, useEffect, useRef } from "react";

import { generatePlayer, players } from "./PlayerAndMonsters/player";
import { generateMonster } from "./PlayerAndMonsters/monsters";

import Styles from "./Styles/Game.module.scss";
import { BattleWinner, Hitpoints, Monster, Player } from "./types";
import { sleep } from "./utils/utils";

const MID_LIFE = 7;
const LOW_LIFE = 3;

export const Game = () => {
  const [player, setPlayer] = useState<Player>(generatePlayer());
  const [monster, setMonster] = useState<Monster>(generateMonster());

  const containerRef = useRef<HTMLDivElement>(null);

  // Adding the initial max life points
  const { hitpoints: maxPlayerLife } = generatePlayer();
  const { hitpoints: maxMonsterLife } = generateMonster();

  const [logMessage, setLogMessage] = useState<string[]>([]);
  const [stageWinner, setStageWinner] = useState<BattleWinner>("monster");
  const gameTiles = 3;
  const hasWon = player.stage + 1 > gameTiles;

  let playerIsDead = player.hitpoints <= 0;

  // Each time the player enters a new stage, a new monster will be generated
  useEffect(() => {
    setMonster(generateMonster());
    const mapSize = containerRef.current;

    if (mapSize) {
      randomCoords(setPlayer, mapSize);
      randomCoords(setMonster, mapSize);
    }
  }, [player.stage]);

  const handleMessages = (message: string) => {
    const dateTime = new Date().toLocaleTimeString();
    return logMessage.unshift(`${dateTime} ${message}`);
  };

  return (
    <div className={Styles.gameGrid}>
      <section className={Styles.mapSection} ref={containerRef}>
        <Tile stage={player.stage} player={player} monster={monster} />
      </section>

      <section className={Styles.statsSection}>
        {!hasWon && (
          <>
            <div className={Styles.statsHeaderContainer}>
              <h2 className={Styles.statsHeader}>Stats </h2>
              <h2>{`Stage ${player.stage}`}</h2>
            </div>

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
                setPlayer({ ...player, stage: player.stage + 1 });
                setStageWinner("monster");
                handleMessages(
                  player.stage === 2
                    ? "player win!"
                    : `player changed to stage ${player.stage + 1}`
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

const Tile = ({
  stage,
  player,
  monster,
}: {
  stage: number;
  player: Player;
  monster: Monster;
}) => {
  return (
    <div className={Styles.tileContainer}>
      <div
        className={`${Styles.player} ${
          player.hitpoints <= MID_LIFE ? Styles.isAboutToDie : ""
        } ${player.hitpoints <= 0 ? Styles.isDead : ""} `}
        style={{
          left: `${player.coords.xPosition}px`,
          top: `${player.coords.yPosition}px`,
        }}
      >
        <span>player</span>
      </div>
      <div
        className={`${Styles.monster} ${
          monster.hitpoints <= MID_LIFE ? Styles.isAboutToDie : ""
        } ${monster.hitpoints <= 0 ? Styles.isDead : ""} `}
        style={{
          left: `${monster.coords.xPosition}px`,
          top: `${monster.coords.yPosition}px`,
        }}
      >
        <span>monster</span>
      </div>
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
        className={`${Styles.progress} ${
          value <= MID_LIFE ? Styles.lowHealth : ""
        } ${value <= LOW_LIFE ? Styles.aboutToDie : ""}`}
        value={value}
        max={maxValue}
      />
    </div>
  );
};

function randomCoords<T>(
  setter: React.Dispatch<React.SetStateAction<T>>,
  mapSize: HTMLDivElement
) {
  // element size represents a monster or a player
  const elementSize = 16;

  const containerWidth = mapSize.clientWidth;
  // const containerWidth = 962;
  const containerHeight = mapSize.clientHeight;
  // const containerHeight = 601;

  // monster starts at the top of the map within a Y range from 0 - 50px
  const monsterMaxPositionInY = 50;

  // Player starts at the bottom of the map within a Y range from 0 - npx
  const playerMaxPositionInY = 80;

  const mathRounded = (containerSize: number) => {
    const mathCalc = Math.floor(Math.random() * containerSize);
    return mathCalc;
  };

  const randomPosition = (containerSize: number) => {
    let mathCalc = mathRounded(containerSize);
    if (mathCalc <= 16) {
      mathCalc += elementSize;
    } else if (mathCalc + elementSize >= containerSize) {
      mathCalc -= elementSize;
    }
    return mathCalc;
  };

  // setPlayer({
  //   ...player,
  //   coords: {
  //     xPosition: randomPosition(containerWidth || 0),
  //     yPosition: containerHeight || 0 - randomPosition(playerMaxPositionInY),
  //   },
  // });

  setter((obj) => ({
    ...obj,
    coords: {
      xPosition: randomPosition(containerWidth || 0),
      yPosition: containerHeight || 0 - randomPosition(playerMaxPositionInY),
    },
  }));

  // setMonster({
  //   ...monster,
  //   coords: {
  //     xPosition: randomPosition(containerWidth),
  //     yPosition: randomPosition(monsterMaxPositionInY),
  //   },
  // });
}
