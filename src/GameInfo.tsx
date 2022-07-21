import { Link } from "react-router-dom";

import Styles from "./Styles/Game.module.scss";

export const GameInfo = () => {
  return (
    <div className={Styles.gameInfo}>
      <Link to="monster" className={`${Styles.btn} ${Styles.home}`}>
        Monster data
      </Link>
      <Link to="/" className={`${Styles.btn} ${Styles.home}`}>
        Go back
      </Link>
    </div>
  );
};
