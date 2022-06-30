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
      - [x] Dictate who attacks first through a random number
      - [x] On each loop iteration, only one attack is done.
    - [x] Use the winner to determine if user can advance or if we show deathScreen and reset button.
    - [x] Enable advance button when player is winner, show death screen when monster is winner
    - [x] Build deathScreen component with reset button.
      - [x] reset button should now also reset battleWinner
    - [x] Show health of player somewhere
    - comment our code.
    - [x] show monster health
    - add an entry to the logs after every battle

## @isaac doubts...

- how to store the initial values to use them in the reset action?
