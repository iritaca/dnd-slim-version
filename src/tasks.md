- [x] Generate a component that is rendered in App.tsx that will be the holder of state and logic for a single game. Call it <Game>

  - [x] Generate a const called `gameTiles` which will be
        const gameTiles = 3
  - [] Render the gameTiles, generate a component called <Tile> and _then just create a function called `generateTiles`_

    - This function will do a for loop on `gameTiles` and generate a <Tile> on each loop, return the array of Tiles.
    - [x] Call this function on the render tree of <Game>
    - [x] Style the Tile component

  - [x] Generate a state called `playerPosition` to know what tile the player is on.

  - The <Tile> component should recieve a prop `playerHere` determined by `playerPosition === i`
    - [x] Render an X inside the <Tile> component if prop is `true`
  - [x] Generate a button at the bottom of your Game component, that says "Advance", when clicked add 1 to `playerPosition`

[x][][]

[ADVANCE]

NEXT UP:

- [x] Win screen and reset game functionality
- Attacking and death screen
