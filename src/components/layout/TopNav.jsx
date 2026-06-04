import { Link } from 'react-router-dom'
import styles from './TopNav.module.css'

export default function TopNav({ right }) {
  return (
    <header className={styles.nav}>
      <Link to="/" className={styles.logo}>
        SKILL<span>DUEL</span>
        <small className={styles.tag}>by Artiva Latam</small>
      </Link>
      {right && <div>{right}</div>}
    </header>
  )
}
