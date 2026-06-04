import { useState, useEffect } from 'react'
import { Link }    from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getProfile } from '../lib/supabase'
import TopNav      from '../components/layout/TopNav'
import BottomNav   from '../components/layout/BottomNav'
import styles      from './Home.module.css'

const CATEGORIES = [
  {
    id: 'marketing', slug: 'Marketing Digital', name: 'Marketing Digital',
    count: '247 jugadores activos', featured: true,
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/><path d="M10 6v4l2.5 2.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  },
  {
    id: 'ux', slug: 'UX & UI', name: 'UX & UI', count: '134 jugadores',
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="16" height="16" rx="3.5" stroke="#7421fc" strokeWidth="1.5"/><circle cx="10" cy="9" r="2.5" fill="#7421fc" opacity=".4"/><path d="M5 16c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="#7421fc" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  },
  {
    id: 'social', slug: 'Social & Ads', name: 'Social & Ads', count: '189 jugadores',
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="6" cy="10" r="2" fill="#7421fc"/><circle cx="14" cy="5" r="2" fill="#7421fc" opacity=".6"/><circle cx="14" cy="15" r="2" fill="#7421fc" opacity=".6"/><path d="M8 9l4-3M8 11l4 3" stroke="#7421fc" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  },
  {
    id: 'frontend', slug: 'Programacion Frontend', name: 'Frontend', count: '156 jugadores',
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6.5 6.5l-4 3.5 4 3.5M13.5 6.5l4 3.5-4 3.5M11 4l-2 12" stroke="#7421fc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    id: 'seo', slug: 'SEO', name: 'SEO', count: '98 jugadores',
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="5.5" stroke="#7421fc" strokeWidth="1.8"/><path d="M13 13l4 4" stroke="#7421fc" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  },
  {
    id: 'copy', slug: 'Copywriting', name: 'Copywriting', count: '76 jugadores',
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3.5 5.5h13M3.5 10h8.5M3.5 14.5h5.5" stroke="#7421fc" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  },
  {
    id: 'ia', slug: 'Inteligencia Artificial', name: 'Inteligencia Artificial', count: '312 jugadores',
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="3" fill="#7421fc" opacity=".4"/><circle cx="10" cy="10" r="7" stroke="#7421fc" strokeWidth="1.5" strokeDasharray="3 2"/><circle cx="10" cy="3" r="1.5" fill="#7421fc"/><circle cx="10" cy="17" r="1.5" fill="#7421fc"/><circle cx="3" cy="10" r="1.5" fill="#7421fc"/><circle cx="17" cy="10" r="1.5" fill="#7421fc"/></svg>,
  },
]

function CategoryCard({ cat }) {
  if (cat.featured) {
    return (
      <Link to={`/jugar?cat=${encodeURIComponent(cat.slug)}`} className={`${styles.cat} ${styles.catFeatured}`}>
        <div className={`${styles.catIcon} ${styles.catIconFeatured}`}>{cat.icon}</div>
        <div>
          <div className={styles.catName}>{cat.name}</div>
          <div className={styles.catCount}>{cat.count}</div>
        </div>
        <span className={styles.hotBadge}>Hot</span>
      </Link>
    )
  }
  return (
    <Link to={`/jugar?cat=${encodeURIComponent(cat.slug)}`} className={styles.cat}>
      <div className={styles.catIcon}>{cat.icon}</div>
      <div className={styles.catName}>{cat.name}</div>
      <div className={styles.catCount}>{cat.count}</div>
    </Link>
  )
}

export default function Home() {
  const { user }            = useAuth()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (!user) return
    getProfile(user.id).then(setProfile)
  }, [user])

  const winRate = profile?.duels_played > 0
    ? Math.round((profile.duels_won / profile.duels_played) * 100)
    : 0

  return (
    <div className={styles.page}>
      <TopNav right={
        <Link to="/perfil" className={styles.avatar}>
          {profile?.avatar_initials || '..'}
        </Link>
      }/>

      <main className={styles.content}>

        <div className={styles.hero}>
          <div className={styles.eyebrow}>Demuestra lo que sabes</div>
          <h1 className={styles.heroTitle}>DUELA<br/><em>TUS</em><br/>SKILLS</h1>
          <p className={styles.heroSub}>60 seg · 5 preguntas · 1 ganador</p>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <div className={styles.statNum}>{profile?.duels_won || 0}</div>
            <div className={styles.statLabel}>Ganados</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNum}>{winRate}%</div>
            <div className={styles.statLabel}>Win rate</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNum}>{profile?.xp || 0}</div>
            <div className={styles.statLabel}>XP</div>
          </div>
        </div>

        <div className={styles.sec}>
          <div className={styles.secHeader}>
            <span className={styles.secTitle}>Categorias</span>
          </div>
        </div>
        <div className={styles.cats}>
          {CATEGORIES.map(cat => <CategoryCard key={cat.id} cat={cat} />)}
        </div>

        <div className={styles.sec}>
          <div className={styles.secHeader}>
            <span className={styles.secTitle}>Tu progreso</span>
          </div>
        </div>
        <div className={styles.lb} style={{ padding:'16px', marginBottom:'20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
            <span style={{ fontSize:'13px', color:'var(--muted)' }}>Nivel {profile?.level || 1}</span>
            <span style={{ fontSize:'13px', fontWeight:'500', color:'var(--violet)' }}>{profile?.xp || 0} XP</span>
          </div>
          <div style={{ height:'4px', background:'var(--surface2)', borderRadius:'2px', overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:'2px', background:'var(--violet)',
              width: `${Math.min(((profile?.xp || 0) % 500) / 500 * 100, 100)}%`,
              transition: 'width 0.3s'
            }}/>
          </div>
          <div style={{ fontSize:'11px', color:'var(--hint)', marginTop:'6px' }}>
            {500 - ((profile?.xp || 0) % 500)} xp para el siguiente nivel
          </div>
        </div>

        <div className={styles.ctas}>
          <Link to="/jugar?cat=Marketing+Digital" className={styles.btnMain}>JUGAR AHORA</Link>
          <Link to="/ranking" className={styles.btnGhost}>Ver ranking global</Link>
        </div>

      </main>
      <BottomNav />
    </div>
  )
}