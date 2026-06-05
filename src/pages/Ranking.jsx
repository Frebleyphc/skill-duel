import { useState, useEffect } from 'react'
import { Link }      from 'react-router-dom'
import { useAuth }   from '../hooks/useAuth'
import { getRanking, getProfile } from '../lib/supabase'
import TopNav        from '../components/layout/TopNav'
import BottomNav     from '../components/layout/BottomNav'
import styles        from './Ranking.module.css'

const TABS = [
  { key: 'global',    label: 'Global'    },
  { key: 'marketing', label: 'Marketing' },
  { key: 'ux',        label: 'UX & UI'   },
  { key: 'social',    label: 'Social'    },
]

const medalClass = { 1: styles.posGold, 2: styles.posSilver, 3: styles.posBronze }

function LbRow({ player, isMe }) {
  const initials = player.avatar_initials || '??'
  const bg = isMe ? '#7421fc' : '#1b1b1b'
  return (
    <div className={`${styles.lbRow} ${isMe ? styles.lbRowMe : ''}`}>
      <div className={`${styles.pos} ${medalClass[player.position] || ''}`}>
        {player.position}
      </div>
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
  const { user }              = useAuth()
  const [activeTab, setActiveTab] = useState('global')
  const [ranking, setRanking] = useState([])
  const [myProfile, setMyProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [rankData, profileData] = await Promise.all([
        getRanking(20),
        user ? getProfile(user.id) : null
      ])
      setRanking(rankData)
      setMyProfile(profileData)
      setLoading(false)
    }
    load()
  }, [user])

  const myPosition = ranking.find(r => r.id === user?.id)?.position || '—'
  const myXp       = myProfile?.xp || 0

  return (
    <div className={styles.page}>
      <TopNav right={<Link to="/perfil" className={styles.avatar}>
        {myProfile?.avatar_initials || 'JR'}
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
                {ranking.length > 0
                  ? `Top ${Math.round((Number(myPosition) / ranking.length) * 100)}% de jugadores`
                  : 'Sin duelos aun'}
              </div>
            </div>
            <div className={styles.myXp}>{myXp} xp</div>
          </div>
        </div>

        <div className={styles.tabs}>
          {TABS.map(t => (
            <button
              key={t.key}
              className={`${styles.tab} ${activeTab === t.key ? styles.tabOn : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ padding:'20px', color:'var(--muted)', fontSize:'13px' }}>Cargando ranking...</p>
        ) : ranking.length === 0 ? (
          <p style={{ padding:'20px', color:'var(--muted)', fontSize:'13px' }}>
            Aun no hay jugadores en el ranking. ¡Se el primero en jugar!
          </p>
        ) : (
          <div className={styles.list}>
            {ranking.map(player => (
              <LbRow
                key={player.id}
                player={player}
                isMe={player.id === user?.id}
              />
            ))}
          </div>
        )}

      </main>
      <BottomNav />
    </div>
  )
}