import { Link } from "react-router-dom";

import Styles from "./Styles/Game.module.scss";

export const NotFound = () => {
  return (
    <div className={Styles.notFound}>
      <h2>Not found</h2>
      <Link to="/" className={`${Styles.btn} ${Styles.home}`}>
        Go back
      </Link>
    </div>
  );
};
