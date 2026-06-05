import { useState, useEffect } from 'react'
import { Link }      from 'react-router-dom'
import { useAuth }   from '../hooks/useAuth'
import { getRanking, getProfile, getRankingByCategory } from '../lib/supabase'
import TopNav        from '../components/layout/TopNav'
import BottomNav     from '../components/layout/BottomNav'
import styles        from './Ranking.module.css'

const TABS = [
  { key: 'global',              label: 'Global'    },
  { key: 'Marketing Digital',   label: 'Marketing' },
  { key: 'UX & UI',             label: 'UX & UI'   },
  { key: 'Social & Ads',        label: 'Social'    },
  { key: 'Programacion Frontend', label: 'Frontend' },
  { key: 'SEO',                 label: 'SEO'       },
  { key: 'Copywriting',         label: 'Copy'      },
  { key: 'Inteligencia Artificial', label: 'IA'    },
]

const medalClass = { 1: styles.posGold, 2: styles.posSilver, 3: styles.posBronze }

const COLORS = [
  '#c8930a','#5a18c7','#0f6e56','#c0392b','#6c3483',
  '#2e86c1','#117a65','#1a5276','#a04000','#0e6251',
  '#7d6608','#4a235a','#1b2631','#784212','#1a5276',
]

function LbRow({ player, isMe, index }) {
  const initials = player.avatar_initials || '??'
  const bg = isMe ? '#7421fc' : COLORS[index % COLORS.length]
  const pos = player.position || index + 1
  return (
    <div className={`${styles.lbRow} ${isMe ? styles.lbRowMe : ''}`}>
      <div className={`${styles.pos} ${medalClass[pos] || ''}`}>{pos}</div>
      <div className={styles.av} style={{ background: bg }}>{initials}</div>
      <div className={styles.info}>
        <div className={`${styles.name} ${isMe ? styles.nameMe : ''}`}>
          {player.full_name}{isMe ? ' (Tu)' : ''}
        </div>
        <div className={styles.cat}>{player.city || 'Peru'}</div>
      </div>
      <div className={styles.right}>
        <div className={styles.xp}>{player.xp} xp</div>
        <div className={styles.wr}>{player.win_rate}% win rate</div>
      </div>
    </div>
  )
}

export default function Ranking() {
  const { user }                  = useAuth()
  const [activeTab, setActiveTab] = useState('global')
  const [ranking, setRanking]     = useState([])
  const [myProfile, setMyProfile] = useState(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (user) getProfile(user.id).then(setMyProfile)
  }, [user])

  useEffect(() => {
    setLoading(true)
    const fetch = activeTab === 'global'
      ? getRanking(20)
      : getRankingByCategory(activeTab, 20)
    fetch.then(data => { setRanking(data); setLoading(false) })
  }, [activeTab])

  const myPosition = ranking.find(r => r.id === user?.id)?.position || '—'
  const myXp       = myProfile?.xp || 0

  return (
    <div className={styles.page}>
      <TopNav right={<Link to="/perfil" className={styles.avatar}>
        {myProfile?.avatar_initials || '..'}
      </Link>} />

      <main className={styles.content}>

        <div className={styles.hero}>
          <div className={styles.eyebrow}>Semana actual</div>
          <h1 className={styles.heroTitle}>TOP <em>DUELISTAS</em><br/>PERU</h1>
          <div className={styles.myCard}>
            <div className={styles.myPos}>#{myPosition}</div>
            <div>
              <div className={styles.myName}>Tu posicion</div>
              <div className={styles.mySub}>
                {activeTab === 'global' ? 'Ranking global' : activeTab}
              </div>
            </div>
            <div className={styles.myXp}>{myXp} xp</div>
          </div>
        </div>

        {/* TABS con scroll horizontal */}
        <div style={{ overflowX:'auto', padding:'16px 20px 0' }}>
          <div style={{ display:'flex', gap:'6px', width:'max-content' }}>
            {TABS.map(t => (
              <button
                key={t.key}
                style={{
                  padding:'7px 14px', borderRadius:'20px', border:'none',
                  cursor:'pointer', fontSize:'12px', fontWeight: activeTab === t.key ? '600' : '400',
                  fontFamily:'var(--body)', whiteSpace:'nowrap', transition:'all 0.15s',
                  background: activeTab === t.key ? 'var(--violet)' : 'var(--surface)',
                  color: activeTab === t.key ? '#fff' : 'var(--muted)',
                  border: activeTab === t.key ? 'none' : '0.5px solid var(--border)',
                }}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p style={{ padding:'20px', color:'var(--muted)', fontSize:'13px' }}>Cargando...</p>
        ) : ranking.length === 0 ? (
          <p style={{ padding:'20px', color:'var(--muted)', fontSize:'13px' }}>
            Nadie ha jugado en esta categoria aun. ¡Se el primero!
          </p>
        ) : (
          <div className={styles.list} style={{ marginTop:'16px' }}>
            {ranking.map((player, i) => (
              <LbRow
                key={player.user_id || player.id}
                player={player}
                isMe={player.user_id === user?.id || player.id === user?.id}
                index={i}
              />
            ))}
          </div>
        )}

      </main>
      <BottomNav />
    </div>
  )
}