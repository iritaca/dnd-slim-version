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

  - [x] player should appear in random position x=(0 - 100px) y=(0 - 100px)
  - [x] monster should appear in random position
  - [x] when monster died it should disappear
  - [x] when monster is kill, a door should appear in a random position

  ## Task 4:

- [x] player movement
- [x] No out of bounds movement
- [x] if player box is inside monster box, enable attack button
- [x] if player box is inside door box, enable advance button

- [] Random monster movement
  - [x] Get in call to discuss timeouts or intervals
  - [x] If player touches monster, monster stops moving (instant refs)
  - [] Allow monster to flee

## task 5:

- [x] Routing
- [x] generate more monster with random data
- [] Create a new screen to see the stats of the monsters in all the game.
- [x] if player is battling, disable the escape button.

# ideas of what to learn next

# Ideas

- a tile or map could be filled with random monsters, they could be in a herd or alone.
- loot, monsters could drop money, potions, armor or weapons.
- Money could also be used to buy some things in a store

# @isaac doubts ...

if monster goes out of bounds, randomly possition it in the map and let it start moving.

- [] Promises
- [] async/await
- [] useDispatch
- [] useMemo // ya lo hemos platicado, pero hay alguna forma de aplicarlo al proyecto?
- [] se podria implementar algo en el juego para practicar algunos de los metodos de Array mas usados, en el codigo vi some y reduce

- [] implement window local storage to save the game, e.g. let the user be able to fight with a monster and if the player is dying he can go back to a previous moment before the fight, allowing the user to choose another monster or to escape from the stage
