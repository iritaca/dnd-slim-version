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

const MID_LIFE = 7;
const LOW_LIFE = 3;

export const Game = () => {
  const [player, setPlayer] = useState<Player>(generatePlayer());
  const [monster, setMonster] = useState<Monster>(generateMonster());
  const [nextLevelDoor, setNextLevelDoor] = useState<NextLevelDoor>();

  let doorIsVisible = monster.hitpoints <= 0;

  // element size, and position references
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const monsterRef = useRef<HTMLDivElement>(null);
  const doorRef = useRef<HTMLDivElement>(null);

  //Player keyboard movement
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

  const doorIsClosed =
    stageWinner === "monster" || !isCollisioning(doorRef, playerRef);

  const attackIsDisabled =
    monster.hitpoints <= 0 ||
    player.hitpoints <= 0 ||
    hasWon ||
    !isCollisioning(monsterRef, playerRef);

  // Each time the player enters a new stage, a new monster will be generated and new positions will be assignated
  useEffect(() => {
    setMonster(generateMonster());

    const mapSize = containerRef.current;

    if (mapSize) {
      let playerCoords = generateRandomCoords({
        mapSize: mapSize,
        element: "player",
      });
      setPlayer((player) => ({
        ...player,
        coords: {
          xPosition: playerCoords.xCoords,
          yPosition: playerCoords.yCoords,
        },
      }));
      let monsterCoords = generateRandomCoords({
        mapSize: mapSize,
        element: "monster",
      });
      setMonster((monster) => ({
        ...monster,
        coords: {
          xPosition: monsterCoords.xCoords,
          yPosition: monsterCoords.yCoords,
        },
      }));
    }
  }, [player.stage]);

  // @isaac continue with generateRandomCoords for the door as part of the randomCoords refactor

  // Door is visible, but no longer necessary
  // @Ro, i added another if inside this effect to make sure that the monster is dead and that the door should appear only at that moment, and not when the monster is filling his life
  // useEffect(() => {
  //   const mapSize = containerRef.current;
  //   setNextLevelDoor({ coords: { xPosition: 0, yPosition: 0 } });
  //   if (monster.hitpoints <= 0) {
  //     if (mapSize) randomCoords(setNextLevelDoor, mapSize, "door");
  //     console.log("hola");
  //   }
  // }, [doorIsVisible, monster.hitpoints]);

  // useEffect(() => {
  //   const mapSize = containerRef.current;
  //   if (monster.hitpoints <= 0 && mapSize) {
  //     const coords = randomCoords(mapSize, 'door')
  //     setNextLevelDoor(coords)
  //   }
  // }, [monster.hitpoints]);

  const handleMessages = (message: string) => {
    const dateTime = new Date().toLocaleTimeString();
    return logMessage.unshift(`${dateTime} ${message}`);
  };

  return (
    <div className={Styles.gameGrid}>
      <section className={Styles.mapSection} ref={containerRef}>
        <Tile
          player={player}
          monster={monster}
          door={nextLevelDoor}
          playerRef={playerRef}
          monsterRef={monsterRef}
          doorRef={doorRef}
        />
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
            disabled={attackIsDisabled}
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
                //setDoor undefined
              }}
              className={`${Styles.btn} ${Styles.advance}`}
              disabled={doorIsClosed}
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
  playerRef,
  monsterRef,
  doorRef,
}: {
  player: Player;
  monster: Monster;
  door: NextLevelDoor | undefined;
  playerRef: React.RefObject<HTMLDivElement>;
  monsterRef: React.RefObject<HTMLDivElement>;
  doorRef: React.RefObject<HTMLDivElement>;
}) => {
  return (
    <div className={Styles.tileContainer}>
      <div
        ref={playerRef}
        className={`${Styles.playerCenterPoint} ${
          player.hitpoints <= MID_LIFE ? Styles.isAboutToDie : ""
        } ${player.hitpoints <= 0 ? Styles.isDead : ""} `}
        style={{
          left: `${player.coords.xPosition}px`,
          top: `${player.coords.yPosition}px`,
        }}
      >
        <div
          className={`${Styles.player} ${
            isCollisioning(monsterRef, playerRef) ? Styles.pulseAnimation : ""
          }`}
        ></div>
        <span className={Styles.elementTitle}>player</span>
      </div>
      <div
        ref={monsterRef}
        className={`${Styles.monster} ${
          monster.hitpoints <= MID_LIFE ? Styles.isAboutToDie : ""
        } ${monster.hitpoints <= 0 ? Styles.isDead : ""} `}
        style={{
          left: `${monster.coords.xPosition}px`,
          top: `${monster.coords.yPosition}px`,
        }}
      >
        <span className={Styles.elementTitle}>monster</span>
      </div>

      {monster.hitpoints <= 0 && (
        <div
          ref={doorRef}
          className={`${Styles.door} ${
            monster.hitpoints <= 0 ? Styles.isVisible : ""
          }`}
          style={
            {
              // left: `${door.coords.xPosition}px`,
              // top: `${door.coords.yPosition}px`,
            }
          }
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

function generateRandomCoords({
  mapSize,
  element,
}: {
  mapSize: HTMLDivElement;
  element: "player" | "monster" | "door";
}) {
  //monster and player size
  const generalSize = 16;

  //randomCoords(mapSize,element)
  const mapMaxWidth = mapSize.clientWidth;
  const mapMaxHeight = mapSize.clientHeight;

  // Monster max starting height position
  const monsterMaxPositionInY = 50;

  // Player max starting height position
  const playerMaxPositionInY = 80;

  // Calculates the min and max value, and if the element random position is smaller or bigger than the map, the size of the element is added.
  const randomPosition = (maxContainerHeight: number) => {
    let randomPosition = Math.random() * maxContainerHeight;
    if (randomPosition <= generalSize) {
      randomPosition += generalSize;
    } else if (randomPosition + generalSize >= maxContainerHeight) {
      randomPosition -= generalSize;
    }
    return randomPosition;
  };

  // Evaluating maxPositionInY
  const randomYPosition = () => {
    let yRandomPosition;
    if (element === "player") {
      yRandomPosition = mapMaxHeight - randomPosition(playerMaxPositionInY);
    } else if (element === "monster") {
      yRandomPosition = randomPosition(monsterMaxPositionInY);
    } else {
      yRandomPosition = randomPosition(mapMaxHeight);
    }
    return yRandomPosition;
  };

  const xCoords = randomPosition(mapMaxWidth);
  const yCoords = randomYPosition();
  const randomPositionCoords = { xCoords, yCoords };

  return randomPositionCoords;
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

  if (direction === "yAxisUp" && position <= 7) {
    console.log("can't go beyond the limits");

    return !outOfBound;
  }
  if (direction === "yAxisDown" && position >= maxHeightBound - 12) {
    console.log("can't go beyond the limits");

    return !outOfBound;
  }
  if (direction === "xAxisLeft" && position <= 7) {
    console.log("can't go beyond the limits");

    return !outOfBound;
  }
  if (direction === "xAxisRight" && position >= maxWidthBound - 12) {
    console.log("can't go beyond the limits");

    return !outOfBound;
  }

  return outOfBound;
}

function isCollisioning(
  container: React.RefObject<HTMLDivElement>,
  content: React.RefObject<HTMLDivElement>
) {
  //Container like monster and door needs these 4 points to create a bounding box, which would let us know if the player is inside the container
  const containerAttributes = container.current?.getBoundingClientRect();
  const containerXOrigin = containerAttributes?.left;
  const containerYOrigin = containerAttributes?.top;
  const containerXBoundry = containerAttributes?.right;
  const containerYBoundry = containerAttributes?.bottom;

  //content: in this case the player only needs the point origin
  const contentAttributes = content.current?.getBoundingClientRect();
  const contentXOrigin = contentAttributes?.left;
  const contentYOrigin = contentAttributes?.top;

  const increasedRange = 6;

  const contentIsInsideContainer =
    (contentXOrigin || 0) <= (containerXBoundry || 0) + increasedRange &&
    (contentXOrigin || 0) >= (containerXOrigin || 0) - increasedRange &&
    (contentYOrigin || 0) <= (containerYBoundry || 0) + increasedRange &&
    (contentYOrigin || 0) >= (containerYOrigin || 0) - increasedRange;

  // console.log({
  //   containerAttributes,
  //   contentXOrigin,
  //   contentYOrigin,
  //   contentIsInsideContainer,
  // });

  return contentIsInsideContainer;
}
