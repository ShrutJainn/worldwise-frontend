import styles from "./Loader.module.css";

import { Loader2 } from "lucide-react";

function Loader() {
  return <Loader2 className={styles.spinner} />;
}

export default Loader;
