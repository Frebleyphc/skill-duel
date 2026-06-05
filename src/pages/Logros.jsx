import { useEffect, useState } from 'react'
import { Link }      from 'react-router-dom'
import { useAuth }   from '../hooks/useAuth'
import { getProfile } from '../lib/supabase'
import TopNav        from '../components/layout/TopNav'
import BottomNav     from '../components/layout/BottomNav'
import styles        from './Logros.module.css'

const ALL_BADGES = [
  {
    id: 'first-win',  name: 'Primera Victoria', req: 'Gana tu primer duelo',
    earned: p => p?.duels_won >= 1,
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.9 6.5 7.1 1-5.1 5 1.2 7L12 18l-6.1 3.5 1.2-7L2 9.5l7.1-1L12 2z" fill="#7421fc"/></svg>,
  },
  {
    id: 'streak5',    name: 'Racha x5', req: 'Gana 5 duelos seguidos',
    earned: p => p?.current_streak >= 5,
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#7421fc"/></svg>,
  },
  {
    id: 'ten-duels',  name: '10 Duelos', req: 'Juega 10 duelos',
    earned: p => p?.duels_played >= 10,
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="#7421fc" opacity=".2"/><path d="M8 12l3 3 5-5" stroke="#7421fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    id: 'xp500',      name: '500 XP', req: 'Acumula 500 XP',
    earned: p => p?.xp >= 500,
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="13" width="4" height="8" rx="1" fill="#7421fc"/><rect x="10" y="8" width="4" height="13" rx="1" fill="#7421fc" opacity=".6"/><rect x="17" y="3" width="4" height="18" rx="1" fill="#7421fc" opacity=".3"/></svg>,
  },
  {
    id: 'level5',     name: 'Nivel 5', req: 'Alcanza el nivel 5',
    earned: p => p?.level >= 5,
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.9 6.5 7.1 1-5.1 5 1.2 7L12 18l-6.1 3.5 1.2-7L2 9.5l7.1-1L12 2z" stroke="#7a746c" strokeWidth="1.8" strokeLinejoin="round"/></svg>,
  },
  {
    id: 'legend',     name: 'Leyenda', req: 'Alcanza el nivel 10',
    earned: p => p?.level >= 10,
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="7" y="11" width="10" height="9" rx="2" stroke="#7a746c" strokeWidth="1.8"/><path d="M8 11V7a4 4 0 018 0v4" stroke="#7a746c" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  },
]

const CAT_PROGRESS = [
  {
    id: 'marketing', name: 'Marketing Digital',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="#7421fc" strokeWidth="1.5"/><path d="M8 5v3l2 2" stroke="#7421fc" strokeWidth="1.5" strokeLinecap="round"/></svg>
  },
  {
    id: 'ux', name: 'UX & UI',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2.5" stroke="#7421fc" strokeWidth="1.5"/><circle cx="8" cy="7" r="2" fill="#7421fc" opacity=".4"/><path d="M5 13c0-1.7 1.3-3 3-3s3 1.3 3 3" stroke="#7421fc" strokeWidth="1.5" strokeLinecap="round"/></svg>
  },
  {
    id: 'social', name: 'Social & Ads',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="4" cy="8" r="1.5" fill="#7421fc"/><circle cx="12" cy="4" r="1.5" fill="#7421fc" opacity=".6"/><circle cx="12" cy="12" r="1.5" fill="#7421fc" opacity=".6"/><path d="M5.5 7.5l5-3M5.5 8.5l5 3" stroke="#7421fc" strokeWidth="1.2" strokeLinecap="round"/></svg>
  },
  {
    id: 'frontend', name: 'Frontend',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 5l-3 3 3 3M11 5l3 3-3 3M9.5 3l-3 10" stroke="#7421fc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  },
  {
    id: 'seo', name: 'SEO',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="#7421fc" strokeWidth="1.5"/><path d="M11 11l3 3" stroke="#7421fc" strokeWidth="1.5" strokeLinecap="round"/></svg>
  },
  {
    id: 'copy', name: 'Copywriting',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 4.5h10M3 8h6.5M3 11.5h4" stroke="#7421fc" strokeWidth="1.5" strokeLinecap="round"/></svg>
  },
  {
    id: 'ia', name: 'Inteligencia Artificial',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" fill="#7421fc" opacity=".4"/><circle cx="8" cy="8" r="6" stroke="#7421fc" strokeWidth="1.2" strokeDasharray="2.5 1.5"/><circle cx="8" cy="2" r="1" fill="#7421fc"/><circle cx="8" cy="14" r="1" fill="#7421fc"/><circle cx="2" cy="8" r="1" fill="#7421fc"/><circle cx="14" cy="8" r="1" fill="#7421fc"/></svg>
  },
]

export default function Logros() {
  const { user }              = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getProfile(user.id).then(data => {
      setProfile(data)
      setLoading(false)
    })
  }, [user])

  const earnedCount = ALL_BADGES.filter(b => b.earned(profile)).length
  const xpProgress  = profile ? ((profile.xp % 500) / 500) * 100 : 0
  const xpToNext    = profile ? 500 - (profile.xp % 500) : 500

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      minHeight:'100vh', background:'var(--cream)', color:'var(--muted)', fontSize:'13px' }}>
      Cargando...
    </div>
  )

  return (
    <div className={styles.page}>
      <TopNav right={<Link to="/perfil" className={styles.avatar}>
        {profile?.avatar_initials || '..'}
      </Link>} />

      <main className={styles.content}>

        {/* LEVEL */}
        <div className={styles.levelHeader}>
          <svg width="72" height="72" viewBox="0 0 72 72" style={{ flexShrink:0 }}>
            <circle cx="36" cy="36" r="28" fill="none" stroke="#f4f1ec" strokeWidth="7"/>
            <circle cx="36" cy="36" r="28" fill="none" stroke="#7421fc" strokeWidth="7"
              strokeDasharray="175.9"
              strokeDashoffset={175.9 - (175.9 * xpProgress / 100)}
              strokeLinecap="round" transform="rotate(-90 36 36)"/>
            <text x="36" y="40" textAnchor="middle"
              fontFamily="Sora,sans-serif" fontSize="13" fontWeight="800" fill="#1b1b1b">
              Nv {profile?.level || 1}
            </text>
          </svg>
          <div className={styles.ringInfo}>
            <div className={styles.ringTitle}>Nivel {profile?.level || 1}</div>
            <div className={styles.ringSub}>{xpToNext} xp para el siguiente nivel</div>
            <div className={styles.xpTotal}>{profile?.xp || 0} <span>XP total</span></div>
            <div className={styles.lvBar}><div className={styles.lvFill} style={{ width:`${xpProgress}%` }}/></div>
          </div>
        </div>

        {/* STREAK */}
        <div className={styles.sec} style={{ marginTop:20 }}>
          <div className={styles.secHeader}><span className={styles.secTitle}>Racha activa</span></div>
        </div>
        <div className={styles.streakCard}>
          <div className={styles.streakNum}>{profile?.current_streak || 0}</div>
          <div>
            <div className={styles.streakLabel}>Victorias seguidas</div>
<div className={styles.streakTitle}>
  {profile?.current_streak >= 3 ? 'Racha de fuego' : profile?.current_streak >= 1 ? 'Racha activa' : 'Sin racha'}
</div>
<div className={styles.streakSub}>
  {profile?.current_streak >= 1 ? 'Sigue ganando para aumentarla' : 'Gana un duelo para empezar'}
</div>
          </div>
          {profile?.current_streak >= 3 && (
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ marginLeft:'auto' }}>
              <path d="M18 4c0 6-8 10-8 16a8 8 0 0016 0c0-6-8-10-8-16z" fill="#d0ff5f" opacity=".9"/>
              <path d="M18 16c0 3-4 5-4 8a4 4 0 008 0c0-3-4-5-4-8z" fill="#a8cc3a"/>
            </svg>
          )}
        </div>

        {/* BADGES */}
        <div className={styles.sec}>
          <div className={styles.secHeader}>
            <span className={styles.secTitle}>Insignias</span>
            <span className={styles.secLink}>{earnedCount} / {ALL_BADGES.length}</span>
          </div>
        </div>
        <div className={styles.badgeGrid}>
          {ALL_BADGES.map(b => {
            const isEarned = b.earned(profile)
            return (
              <div key={b.id} className={`${styles.badge} ${isEarned ? styles.badgeEarned : styles.badgeLocked}`}>
                <div className={styles.badgeIcon}>{b.icon}</div>
                <div className={styles.badgeName}>{b.name}</div>
                <div className={styles.badgeSub}>{isEarned ? 'Ganado' : b.req}</div>
              </div>
            )
          })}
        </div>

        {/* CAT PROGRESS */}
        <div className={styles.sec}>
          <div className={styles.secHeader}>
            <span className={styles.secTitle}>Progreso por categoria</span>
          </div>
        </div>
        <div className={styles.cpList}>
          {CAT_PROGRESS.map(c => (
            <div key={c.id} className={styles.cpRow}>
              <div className={styles.cpIcon}>{c.icon}</div>
              <div className={styles.cpInfo}>
                <div className={styles.cpName}>{c.name}</div>
                <div className={styles.cpBar}>
                  <div className={styles.cpFill} style={{ width:'0%' }}/>
                </div>
              </div>
              <div className={styles.cpPct}>0%</div>
            </div>
          ))}
        </div>

      </main>
      <BottomNav />
    </div>
  )
}