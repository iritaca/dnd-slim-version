- Attacking and death screen

  - Player is generated on <Game>
    - Refactor `playerPosition` to be a value in the player object
    - Send player to <Tile>, calculate `playerIsHere` inside <Tile>
    - Create `generatePlayer` function

  - Monsters are generated on each <Tile>
    - Create `generateMonster` function
    
  - Battles should happen on a <Tile>
    - Create useEffect that runs when `playerIsHere`
    - Create function `battle` battle(player, monster, setPlayer, setMonster) that returns the winner
      - Dictate who attacks first through a random number
    - Use the winner to determine if user can advance or if we show deathScreen and reset button.
