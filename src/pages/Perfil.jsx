import { useState, useEffect } from 'react'
import { Link }        from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { supabase, getProfile, getDuelHistory } from '../lib/supabase'
import { useAuth }     from '../hooks/useAuth'
import TopNav          from '../components/layout/TopNav'
import BottomNav       from '../components/layout/BottomNav'
import styles          from './Perfil.module.css'

const BADGES = [
  { id:'first',   name:'Primera\nVictoria', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.9 6.5 7.1 1-5.1 5 1.2 7L12 18l-6.1 3.5 1.2-7L2 9.5l7.1-1L12 2z" fill="#7421fc"/></svg> },
  { id:'streak',  name:'Racha x5',          icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#7421fc"/></svg> },
  { id:'perfect', name:'Perfecto\n5/5',     icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="#7421fc" opacity=".2"/><path d="M8 12l3 3 5-5" stroke="#7421fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id:'top50',   name:'Top 50',            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="13" width="4" height="8" rx="1" fill="#7421fc"/><rect x="10" y="8" width="4" height="13" rx="1" fill="#7421fc" opacity=".6"/><rect x="17" y="3" width="4" height="18" rx="1" fill="#7421fc" opacity=".3"/></svg> },
]

const TABS = ['Skills', 'Historial', 'Logros']

export default function Perfil() {
  const { user }                = useAuth()
  const navigate                = useNavigate()
  const [activeTab, setActiveTab] = useState('Skills')
  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [duelHistory, setDuelHistory] = useState([])

  useEffect(() => {
    if (!user) return
    getProfile(user.id).then(data => {
      setProfile(data)
      setLoading(false) 
    })
    getDuelHistory(user.id, 10).then(setDuelHistory)
  }, [user])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const winRate = profile?.duels_played > 0
    ? Math.round((profile.duels_won / profile.duels_played) * 100)
    : 0

  const initials = profile?.avatar_initials || '?'
  const name     = profile?.full_name || 'Usuario'
  const handle   = profile?.handle ? `@${profile.handle}` : ''
  const city     = profile?.city || ''

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      minHeight:'100vh', background:'var(--cream)', color:'var(--muted)', fontSize:'13px' }}>
      Cargando...
    </div>
  )

  return (
    <div className={styles.page}>
      <TopNav />
      <main className={styles.content}>

        <div className={styles.hero}>
          <div className={styles.heroTop}>
            <div className={styles.av}>{initials}</div>
            <div className={styles.heroInfo}>
              <div className={styles.heroName}>{name}</div>
              <div className={styles.heroHandle}>
                {handle}{city ? ` · ${city}` : ''}
              </div>
              <div className={styles.heroTag}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 1l1.2 2.7 3 .4-2.1 2 .5 3L5 7.8 2.4 9.1l.5-3L.9 4.1l3-.4L5 1z" fill="#d0ff5f"/>
                </svg>
                Nivel {profile?.level || 1}
              </div>
            </div>
            <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
              <button className={styles.editBtn}>Editar</button>
              <button className={styles.editBtn} onClick={handleLogout}
                style={{ color:'rgba(255,100,100,0.7)' }}>Salir</button>
            </div>
          </div>
          <div className={styles.heroStats}>
            {[
              { val: profile?.duels_played || 0,  lbl: 'Duelos'   },
              { val: `${winRate}%`,                lbl: 'Win rate' },
              { val: profile?.current_streak || 0, lbl: 'Racha'    },
              { val: `${profile?.xp || 0} xp`,     lbl: 'XP'       },
            ].map(s => (
              <div key={s.lbl} className={styles.heroStat}>
                <div className={styles.heroStatNum}>{s.val}</div>
                <div className={styles.heroStatLbl}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.tabs}>
          {TABS.map(t => (
            <button key={t}
              className={`${styles.tab} ${activeTab === t ? styles.tabOn : ''}`}
              onClick={() => setActiveTab(t)}>
              {t}
            </button>
          ))}
        </div>

        {activeTab === 'Skills' && (
          <div className={styles.panel}>
            <div className={styles.sec}>
              <div className={styles.secHeader}>
                <span className={styles.secTitle}>Sin skills aun</span>
              </div>
            </div>
            <p style={{ padding:'0 20px 20px', fontSize:'13px', color:'var(--muted)' }}>
              Juega duelos para desbloquear estadisticas por categoria.
            </p>
          </div>
        )}

        {activeTab === 'Historial' && (
  <div className={styles.panel}>
    <div className={styles.sec}>
      <div className={styles.secHeader}>
        <span className={styles.secTitle}>Ultimos duelos</span>
      </div>
    </div>
    {duelHistory.length === 0 ? (
      <p style={{ padding:'0 20px 20px', fontSize:'13px', color:'var(--muted)' }}>
        Juega tu primer duelo para ver tu historial aqui.
      </p>
    ) : (
      <div className={styles.hList}>
        {duelHistory.map(h => {
          const won = h.winner === user?.id
          return (
            <div key={h.id} className={styles.hRow}>
              <div className={`${styles.hResult} ${won ? styles.hWin : styles.hLoss}`}>
                {won ? 'W' : 'L'}
              </div>
              <div className={styles.hInfo}>
                <div className={styles.hCat}>{h.category}</div>
                <div className={styles.hOpp}>
                  {new Date(h.played_at).toLocaleDateString('es-PE', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </div>
              </div>
              <div className={styles.hRight}>
                <div className={styles.hScore}>{h.score_one} — {h.score_two}</div>
                <div className={`${styles.hXp} ${!won ? styles.hXpLoss : ''}`}>
                  {won ? '+180 xp' : '+60 xp'}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )}
  </div>
)}

        {activeTab === 'Logros' && (
          <div className={styles.panel}>
            <div className={styles.sec}>
              <div className={styles.secHeader}>
                <span className={styles.secTitle}>Mis insignias</span>
                <Link to="/logros" className={styles.secLink}>Ver todo</Link>
              </div>
            </div>
            <p style={{ padding:'0 20px 20px', fontSize:'13px', color:'var(--muted)' }}>
              Gana duelos para desbloquear insignias.
            </p>
          </div>
        )}

        <a href="https://artivalatam.com" className={styles.artivaCta}>
          <div className={styles.artivaIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2l2.4 5.4L18 8.3l-4 3.9.9 5.3L10 14.8 5.1 17.5l.9-5.3-4-3.9 5.6-.9L10 2z" fill="#fff"/>
            </svg>
          </div>
          <div>
            <div className={styles.artivaLabel}>Potencia tu perfil</div>
            <div className={styles.artivaTitle}>Ver cursos recomendados en Artiva Latam</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft:'auto', flexShrink:0 }}>
            <path d="M6 4l4 4-4 4" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>

      </main>
      <BottomNav />
    </div>
  )
}