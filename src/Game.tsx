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
const STAGES_LIMIT = 2;

const GAME_TILES = 3;

export const Game = () => {
  const [player, setPlayer] = useState<Player>(generatePlayer());
  const [monster, setMonster] = useState<Monster>(generateMonster());
  const [nextLevelDoor, setNextLevelDoor] = useState<NextLevelDoor>();
  const [logMessage, setLogMessage] = useState<string[]>([]);
  const [stageWinner, setStageWinner] = useState<BattleWinner>("monster");

  // element size, and position references
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const monsterRef = useRef<HTMLDivElement>(null);
  const doorRef = useRef<HTMLDivElement>(null);

  const hasWon = player.stage + 1 > GAME_TILES;
  // Adding the initial max life points
  const maxPlayerLife = player.maxHitpoints;
  const maxMonsterLife = monster.maxHitpoints;

  const playerIsDead = player.hitpoints <= 0;

  const doorIsClosed =
    stageWinner === "monster" || !isCollisioning(doorRef, playerRef);

  const attackIsDisabled =
    monster.hitpoints <= 0 ||
    player.hitpoints <= 0 ||
    hasWon ||
    !isCollisioning(monsterRef, playerRef);

  //Monster random movement
  const playerTouchingMonster = isCollisioning(monsterRef, playerRef);
  useEffect(() => {
    const mapSize = containerRef.current;
    let monsterMovementOverTime: any = 0;
    if (!playerTouchingMonster) {
      monsterMovementOverTime = setInterval(() => {
        if (mapSize) {
          // @isaac modificar esta seccion para que aplique el cambio en el ultimo monstruo creado
          const coords = randomNearbyMovement({ monster });

          setMonster((monster) => ({ ...monster, coords }));
        }
      }, 3000);
    }

    return () => clearInterval(monsterMovementOverTime);
  }, [playerTouchingMonster]);

  //Player keyboard movement
  useEffect(() => {
    const mapSize = containerRef.current;

    const keyboardHandler = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w") {
        setPlayer((player) => ({
          ...player,
          coords: {
            x: player.coords.x,
            y: playerOutOfBounds(player.coords.y, mapSize, "yAxisUp")
              ? (player.coords.y -= player.movementMult)
              : player.coords.y,
          },
        }));
      }

      if (e.key === "ArrowDown" || e.key === "s") {
        setPlayer((player) => ({
          ...player,
          coords: {
            x: player.coords.x,

            y: playerOutOfBounds(player.coords.y, mapSize, "yAxisDown")
              ? (player.coords.y += player.movementMult)
              : player.coords.y,
          },
        }));
      }

      if (e.key === "ArrowLeft" || e.key === "a") {
        setPlayer((player) => ({
          ...player,
          coords: {
            x: playerOutOfBounds(player.coords.x, mapSize, "xAxisLeft")
              ? (player.coords.x -= player.movementMult)
              : player.coords.x,
            y: player.coords.y,
          },
        }));
      }

      if (e.key === "ArrowRight" || e.key === "d") {
        setPlayer((player) => ({
          ...player,
          coords: {
            x: playerOutOfBounds(player.coords.x, mapSize, "xAxisRight")
              ? (player.coords.x += player.movementMult)
              : player.coords.x,
            y: player.coords.y,
          },
        }));
      }
    };
    document.addEventListener("keydown", keyboardHandler);
    return () => {
      document.removeEventListener("keydown", keyboardHandler);
    };
  }, []);

  //Action that happens after advancing to the next stage
  useEffect(() => {
    if (player.stage <= STAGES_LIMIT) setMonster(generateMonster());

    const mapSize = containerRef.current;

    if (mapSize) {
      let playerCoords = generateRandomCoords({
        mapSize: mapSize,
        spaceInMap: "player",
      });
      setPlayer((player) => ({
        ...player,
        coords: playerCoords,
      }));
      let monsterCoords = generateRandomCoords({
        mapSize: mapSize,
        spaceInMap: "monster",
      });
      setMonster((monster) => ({
        ...monster,
        coords: monsterCoords,
      }));
    }
    //provisional fix
    setTimeout(() => {
      setLogMessage((logMessages) => [
        addTimerToMessage(
          player.stage <= STAGES_LIMIT
            ? `Stage ${player.stage} started`
            : "Player win!"
        ),
        ...logMessages,
      ]);
    }, 100);
  }, [player.stage]);

  //Door is rendered
  useEffect(() => {
    const mapSize = containerRef.current;
    if (monster.hitpoints <= 0 && mapSize) {
      const coords = generateRandomCoords({
        mapSize: mapSize,
        spaceInMap: "all",
      });

      setNextLevelDoor({ coords: coords });
    }
  }, [monster.hitpoints]);

  const addTimerToMessage = (message: string) => {
    const dateTime = new Date().toLocaleTimeString();
    return `${dateTime} ${message}`;
  };

  // When the monster goes out of the map, a new monster position is generated
  useEffect(() => {
    const { x, y } = monster.coords;
    const mapSize = containerRef.current;
    const mapWidth = mapSize?.clientWidth;
    const mapHeight = mapSize?.clientHeight;

    if (mapSize) {
      const newCoords = generateRandomCoords({
        mapSize: mapSize,
        spaceInMap: "all",
      });
      if (
        x <= 0 ||
        y <= 0 ||
        x >= (mapWidth || 1000) ||
        y >= (mapHeight || 1000)
      ) {
        setMonster((monster) => ({ ...monster, coords: newCoords }));
      }
    }
  }, [monster.coords]);

  //Button actions
  const attackButton = async () => {
    const winner = await doBattle({
      player,
      monster,
      setPlayer,
      setMonster,
      setLogMessage,
      addTimerToMessage,
    });
    setStageWinner(winner);
  };

  const advanceButton = () => {
    setPlayer({ ...player, stage: player.stage + 1 });
    setStageWinner("monster");
    setNextLevelDoor(undefined);
  };

  const resetGame = () => {
    setPlayer(generatePlayer());
    setMonster(generateMonster());
    setStageWinner("monster");
    setLogMessage([]);
    setNextLevelDoor(undefined);
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
          <button
            className={`${Styles.btn} ${Styles.reset}`}
            onClick={resetGame}
          >
            Reset Game
          </button>
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
            onClick={attackButton}
            disabled={attackIsDisabled}
          >
            Attack
          </button>
          <button className={`${Styles.btn} ${Styles.heal}`} disabled>
            Heal
          </button>

          {!hasWon && !playerIsDead && (
            <button
              onClick={advanceButton}
              className={`${Styles.btn} ${Styles.advance}`}
              disabled={doorIsClosed}
            >
              Advance
            </button>
          )}

          <button
            className={`${Styles.btn} ${Styles.run}`}
            onClick={resetGame}
            disabled={player.stage === 0 || hasWon}
          >
            Escape
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
        className={`${Styles.player} ${
          isCollisioning(monsterRef, playerRef) ? Styles.pulseAnimation : ""
        } ${
          isCollisioning(doorRef, playerRef) ? Styles.playerEnteringDoor : ""
        } ${player.hitpoints <= MID_LIFE ? Styles.isAboutToDie : ""} ${
          player.hitpoints <= 0 ? Styles.isDead : ""
        } `}
        ref={playerRef}
        style={{
          left: `${player.coords.x}px`,
          top: `${player.coords.y}px`,
        }}
      >
        <span className={Styles.elementTitle}>player</span>
      </div>
      {/* </div> */}
      <div
        ref={monsterRef}
        className={`${Styles.monster} ${
          monster.hitpoints <= MID_LIFE ? Styles.isAboutToDie : ""
        } ${monster.hitpoints <= 0 ? Styles.isDead : ""} `}
        style={{
          left: `${monster.coords.x}px`,
          top: `${monster.coords.y}px`,
        }}
      >
        <span className={Styles.elementTitle}>monster</span>
      </div>

      {monster.hitpoints <= 0 && (
        <div
          ref={doorRef}
          className={`${Styles.door} ${
            monster.hitpoints <= 0 ? Styles.isVisible : ""
          } `}
          style={{
            left: `${door?.coords.x}px`,
            top: `${door?.coords.y}px`,
          }}
        >
          <span></span>
          <div
            className={
              isCollisioning(doorRef, playerRef) ? Styles.openTheDoor : ""
            }
          ></div>
        </div>
      )}
    </div>
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
  setLogMessage,
  addTimerToMessage,
}: {
  player: Player;
  monster: Monster;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  setMonster: React.Dispatch<React.SetStateAction<Monster>>;
  setLogMessage: React.Dispatch<React.SetStateAction<string[]>>;
  addTimerToMessage: any;
}): Promise<BattleWinner> => {
  let playerHitpoints = player.hitpoints;
  let monsterHitpoints = monster.hitpoints;

  let firstAttacking = Math.random() * 1 >= 0.5 ? "monster" : "player";

  await setLogMessage((logMessages) => {
    return [
      addTimerToMessage(`first attacking: ${firstAttacking}`),
      ...logMessages,
    ];
  });

  while (playerHitpoints >= 0 && monsterHitpoints >= 0) {
    if (firstAttacking === "monster") {
      playerHitpoints -= monster.attackDamage;
      setPlayer({ ...player, hitpoints: playerHitpoints });
      setLogMessage((logMessages) => [
        addTimerToMessage(
          playerHitpoints >= 0
            ? `Player loose ${monster.attackDamage} hitpoints due to an attack by a monster`
            : `Player was killed by a monster`
        ),
        ...logMessages,
      ]);
    } else {
      monsterHitpoints -= player.attackDamage;
      setMonster({ ...monster, hitpoints: monsterHitpoints });
      setLogMessage((logMessages) => [
        addTimerToMessage(
          monsterHitpoints >= 0
            ? `Monster loose ${player.attackDamage} hitpoints due to an attack by a player`
            : `Monster was killed by a player`
        ),
        ...logMessages,
      ]);
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
  spaceInMap,
}: {
  mapSize: HTMLDivElement;
  spaceInMap: "player" | "monster" | "all";
}) {
  //monster and player size
  const generalSize = 16;

  //randomCoords(mapSize: spaceInMap)
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
    if (spaceInMap === "player") {
      yRandomPosition = mapMaxHeight - randomPosition(playerMaxPositionInY);
    } else if (spaceInMap === "monster") {
      yRandomPosition = randomPosition(monsterMaxPositionInY);
    } else {
      yRandomPosition = randomPosition(mapMaxHeight);
    }
    return yRandomPosition;
  };

  const x = randomPosition(mapMaxWidth);
  const y = randomYPosition();
  const randomPositionCoords = { x, y };

  return randomPositionCoords;
}

const randomNearbyMovement = ({ monster }: { monster: Monster }) => {
  const { coords } = monster;
  const maxRandomMovement = 30;
  const xRand = Math.random() * maxRandomMovement;
  const yRand = Math.random() * maxRandomMovement;
  const xIsPositive = Math.random() * 1 > 0.5;
  const yIsPositive = Math.random() * 1 > 0.5;
  let x = 0;
  let y = 0;
  if (xIsPositive) {
    x = coords.x + xRand;
  } else {
    x = coords.x - xRand;
  }
  if (yIsPositive) {
    y = coords.y + yRand;
  } else {
    y = coords.y - yRand;
  }

  const newCoords = { x, y };
  return newCoords;
};

function playerOutOfBounds(
  position: Number,
  bounds: HTMLDivElement | null,
  direction: "yAxisUp" | "yAxisDown" | "xAxisLeft" | "xAxisRight"
) {
  const outOfBound = true;
  if (!bounds || !outOfBound) return;

  const maxWidthBound = bounds?.clientWidth;
  const maxHeightBound = bounds?.clientHeight;

  if (direction === "yAxisUp" && position <= 7) {
    return !outOfBound;
  }
  if (direction === "yAxisDown" && position >= maxHeightBound - 12) {
    return !outOfBound;
  }
  if (direction === "xAxisLeft" && position <= 7) {
    return !outOfBound;
  }
  if (direction === "xAxisRight" && position >= maxWidthBound - 12) {
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

  return contentIsInsideContainer;
}
