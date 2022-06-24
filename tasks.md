- Attacking and death screen

  - [x] Player is generated on <Game>

    - [x] Refactor `playerPosition` to be a value in the player object
    - [x] Send player to <Tile>, calculate `playerIsHere` inside <Tile>
    - [x] Create `generatePlayer` function

  - [x] Monsters are generated on each <Tile>
    - [x] Create `generateMonster` function
  - Battles should happen on a <Tile>
    - [x] Create useEffect that runs when `playerIsHere`
    - Create function `doBattle` battle(player, monster, setPlayer, setMonster) that returns the winner
      - Dictate who attacks first through a random number
    - Use the winner to determine if user can advance or if we show deathScreen and reset button.
