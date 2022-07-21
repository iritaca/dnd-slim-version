import { Link } from "react-router-dom";

import Styles from "./Styles/Game.module.scss";
export const Home = () => {
  return (
    <div className={Styles.homeWrapper}>
      <h2>Home</h2>
      <ul className={Styles.homeMenu}>
        <Link to="/" className={`${Styles.btn} ${Styles.home}`}>
          Home
        </Link>

        <Link to="/game" className={`${Styles.btn} ${Styles.home}`}>
          Game
        </Link>

        <Link to="/game-info" className={`${Styles.btn} ${Styles.home}`}>
          Game Info
        </Link>
      </ul>
    </div>
  );
};
