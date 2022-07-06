import React, { useState, useEffect, useRef } from "react";

import { generatePlayer } from "./PlayerAndMonsters/player";
import { generateMonster } from "./PlayerAndMonsters/monsters";

import Styles from "./Styles/Game.module.scss";
import {
  BattleWinner,
  Hitpoints,
  Monster,
  NextLevelDoor,
  Player,
} from "./types";
import { sleep } from "./utils/utils";
import { generateDoor } from "./PlayerAndMonsters/door";

const MID_LIFE = 7;
const LOW_LIFE = 3;

export const Game = () => {
  const [player, setPlayer] = useState<Player>(generatePlayer());
  const [monster, setMonster] = useState<Monster>(generateMonster());

  //Ro, the initial state of the door should not be to generate a new one, what should be the initial state?
  const [nextLevelDoor, setNextLevelDoor] = useState<NextLevelDoor>(
    generateDoor()
  );

  let doorIsVisible = monster.hitpoints <= 0;

  // Map size
  const containerRef = useRef<HTMLDivElement>(null);

  //Player movement
  useEffect(() => {
    const mapSize = containerRef.current; // this one is repeated, to avoid a log warning
    const keyboardHandler = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w") {
        setPlayer((player) => ({
          ...player,
          coords: {
            xPosition: player.coords.xPosition,
            yPosition: isOutOfBounds(
              player.coords.yPosition,
              mapSize,
              "yAxisUp"
            )
              ? (player.coords.yPosition -= player.movementMult)
              : player.coords.yPosition,
          },
        }));
      }

      if (e.key === "ArrowDown" || e.key === "s") {
        setPlayer((player) => ({
          ...player,
          coords: {
            xPosition: player.coords.xPosition,

            yPosition: isOutOfBounds(
              player.coords.yPosition,
              mapSize,
              "yAxisDown"
            )
              ? (player.coords.yPosition += player.movementMult)
              : player.coords.yPosition,
          },
        }));
      }

      if (e.key === "ArrowLeft" || e.key === "a") {
        setPlayer((player) => ({
          ...player,
          coords: {
            xPosition: isOutOfBounds(
              player.coords.xPosition,
              mapSize,
              "xAxisLeft"
            )
              ? (player.coords.xPosition -= player.movementMult)
              : player.coords.xPosition,
            yPosition: player.coords.yPosition,
          },
        }));
      }

      if (e.key === "ArrowRight" || e.key === "d") {
        setPlayer((player) => ({
          ...player,
          coords: {
            xPosition: isOutOfBounds(
              player.coords.xPosition,
              mapSize,
              "xAxisRight"
            )
              ? (player.coords.xPosition += player.movementMult)
              : player.coords.xPosition,
            yPosition: player.coords.yPosition,
          },
        }));
      }
    };
    document.addEventListener("keydown", keyboardHandler);
    return () => {
      document.removeEventListener("keydown", keyboardHandler);
    };
  }, []);

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
      randomCoords(setPlayer, mapSize, "player");
      randomCoords(setMonster, mapSize, "monster");
    }
  }, [player.stage]);

  // Door is only visible if the monster is dead
  // @Ro, i added another if inside this effect to make sure that the monster is dead and that the door should appear only at that moment, and not when the monster is filling his life
  useEffect(() => {
    const mapSize = containerRef.current;
    setNextLevelDoor(generateDoor());
    if (monster.hitpoints <= 0) {
      if (mapSize) randomCoords(setNextLevelDoor, mapSize, "door");
    }
  }, [doorIsVisible]);

  const handleMessages = (message: string) => {
    const dateTime = new Date().toLocaleTimeString();
    return logMessage.unshift(`${dateTime} ${message}`);
  };

  return (
    <div className={Styles.gameGrid}>
      <section className={Styles.mapSection} ref={containerRef}>
        <Tile player={player} monster={monster} door={nextLevelDoor} />
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
            disabled={
              monster.hitpoints <= 0 ||
              player.hitpoints <= 0 ||
              hasWon ||
              (player.coords.xPosition !== monster.coords.xPosition &&
                player.coords.yPosition !== monster.coords.yPosition)
            }
          >
            <>
              {/* {console.log(player.coords, monster.coords)} */}
              Attack
            </>
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
              disabled={
                stageWinner === "monster" ||
                (player.coords.xPosition !== nextLevelDoor.coords.xPosition &&
                  player.coords.yPosition !== nextLevelDoor.coords.yPosition)
              }
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
  player,
  monster,
  door,
}: {
  player: Player;
  monster: Monster;
  door: NextLevelDoor;
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

      {monster.hitpoints <= 0 && (
        <div
          className={`${Styles.door} ${
            monster.hitpoints <= 0 ? Styles.isVisible : ""
          }`}
          style={{
            left: `${door.coords.xPosition}px`,
            top: `${door.coords.yPosition}px`,
          }}
        >
          <span></span>
        </div>
      )}
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
  mapSize: HTMLDivElement,
  initialRandomHeight: "player" | "monster" | "door"
) {
  // elementSize represents a monster or a player
  const elementSize = 16;

  const containerWidth = mapSize.clientWidth;
  const containerHeight = mapSize.clientHeight;

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
    if (mathCalc <= elementSize) {
      mathCalc += elementSize;
    } else if (mathCalc + elementSize >= containerSize) {
      mathCalc -= elementSize;
    }
    return mathCalc;
  };

  const objectMaxYPosition = () => {
    let randomPositionInY;
    if (initialRandomHeight === "player") {
      randomPositionInY =
        (containerHeight || 0) - randomPosition(playerMaxPositionInY);
    } else if (initialRandomHeight === "monster") {
      randomPositionInY = randomPosition(monsterMaxPositionInY);
    } else {
      randomPositionInY = randomPosition(containerHeight);
    }
    return randomPositionInY;
  };

  // setter that works with setPlayer, setMonster and setDoor
  setter((obj) => ({
    ...obj,
    coords: {
      xPosition: randomPosition(containerWidth || 0),
      yPosition: objectMaxYPosition(),
    },
  }));
}

function isOutOfBounds(
  position: Number,
  bounds: HTMLDivElement | null,
  direction: "yAxisUp" | "yAxisDown" | "xAxisLeft" | "xAxisRight"
) {
  const outOfBound = true;
  if (!bounds || !outOfBound) return;

  const maxWidthBound = bounds?.clientWidth;
  const maxHeightBound = bounds?.clientHeight;

  if (direction === "yAxisUp" && position <= 0) {
    console.log("can't go beyond the limits");

    return !outOfBound;
  }
  if (direction === "yAxisDown" && position >= maxHeightBound - 16) {
    console.log("can't go beyond the limits");

    return !outOfBound;
  }
  if (direction === "xAxisLeft" && position <= 0) {
    console.log("can't go beyond the limits");

    return !outOfBound;
  }
  if (direction === "xAxisRight" && position >= maxWidthBound - 16) {
    console.log("can't go beyond the limits");

    return !outOfBound;
  }

  return outOfBound;
}
