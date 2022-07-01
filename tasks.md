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
    - [x] add an entry to the logs after every battle

  ## Tasks 3:

  - player should appear in random position x=(0 - 100px) y=(0 - 100px)
  - monster should appear in random position (neer to the top of the screen )
  - when monster died it should disappear
  - when monster is kill, a door should appear in a random position

# Monday tasks - player movement

- [] player movement
- [] player collsions with things , e.g. need to be near to the monster to do a battle,

# ideas of what to learn next

# Ideas

- a tile or map could be filled with random monsters, they could be in a herd or alone.
- loot, monsters could drop money, potions, armor or weapons.
- Money could also be used to buy some things in a store

# @isaac doubts ...
