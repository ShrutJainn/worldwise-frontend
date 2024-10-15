import styles from "./SmallScreenMessage.module.css";

function SmallScreenMessage() {
  return (
    <div className={styles.container}>
      This site is not availabe on smaller screens.
    </div>
  );
}

export default SmallScreenMessage;
