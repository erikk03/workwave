import Link from 'next/link';
import styles from '../styles/Home.module.css';


const WelcomePage = () => {

  return (
    <div className={styles.container}>
      <div className={styles.backgroundGraphic}></div>
      <h1 className={styles.header}>Welcome to WorkWave!</h1>
      <div className={styles.blocksContainer}>
        <Link href="/signin">
          <div className={styles.link}>
            <div className={styles.block}>
              <h2 className={styles.blockHeader}>Sign In</h2>
            </div>
          </div>
        </Link>
        <Link href="/signup">
          <div className={styles.link}>
            <div className={styles.block}>
              <h2 className={styles.blockHeader}>Sign Up</h2>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default WelcomePage;

