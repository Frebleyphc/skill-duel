import { NavLink } from 'react-router-dom'
import styles from './BottomNav.module.css'

const links = [
  {
    to: '/', label: 'Inicio',
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 10l7-7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 8.5V16a1 1 0 001 1h3v-4h2v4h3a1 1 0 001-1V8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
  },
  {
    to: '/ranking', label: 'Ranking',
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2l2.4 5.4L18 8.3l-4 3.9.9 5.3L10 14.8 5.1 17.5l.9-5.3-4-3.9 5.6-.9L10 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
  },
  {
    to: '/logros', label: 'Logros',
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2l1.5 4.5H16l-3.7 2.7 1.4 4.3L10 11l-3.7 2.5 1.4-4.3L4 6.5h4.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
  },
  {
    to: '/perfil', label: 'Perfil',
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.6"/><path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
  },
]

export default function BottomNav() {
  return (
    <nav className={styles.nav}>
      {links.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
        >
          {icon}
          <span className={styles.label}>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
