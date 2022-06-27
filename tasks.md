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
      - On each loop iteration, only one attack is done.
    - Use the winner to determine if user can advance or if we show deathScreen and reset button.
    - Enable advance button when player is winner, show death screen when monster is winner
      - Build deathScreen component with reset button.
        - reset button should now also reset battleWinner
    - Show health of player somewhere
    - comment our code.
