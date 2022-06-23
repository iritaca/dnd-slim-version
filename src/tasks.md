- Generate a component that is rendered in App.tsx that will be the holder of state and logic for a single game. Call it <Game>

  - Generate a const called `gameTiles` which will be
    const gameTiles = 3
  - Render the gameTiles, generate a component called <Tile> and then just create a function called `generateTiles`
    - This function will do a for loop on `gameTiles` and generate a <Tile> on each loop, return the array of Tiles.
    - Call this function on the render tree of <Game>
    - Style the Tile component
  - Generate a state called `playerPosition` to know what tile the player is on.

  - The <Tile> component should recieve a prop `playerHere` determined by `playerPosition === i`
    - Render an X inside the <Tile> component if prop is `true`
  - Generate a button at the bottom of your Game component, that says "Advance", when clicked add 1 to `playerPosition`

[x][][]

[ADVANCE]

NEXT UP:

- Win screen and reset game functionality
- Attacking and death screen
