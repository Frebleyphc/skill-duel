import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Trophy, AlertCircle } from 'lucide-react'
import TopNav    from '../components/layout/TopNav'
import BottomNav from '../components/layout/BottomNav'
import styles    from './Matchmaking.module.css'
import { getRandomQuestions, updateStatsAfterDuel, saveDuel } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'


const QUESTION_FALLBACK = [
  { question: '¿Que es el marketing de contenidos?', option_a: 'Pagar anuncios', option_b: 'Crear contenido valioso', option_c: 'Enviar emails', option_d: 'Comprar seguidores', correct: 1 },
  { question: '¿Que es un wireframe?', option_a: 'Prototipo con colores', option_b: 'Esquema basico de pantalla', option_c: 'Logo', option_d: 'Tipo de fuente', correct: 1 },
  { question: '¿Que es el CPM?', option_a: 'Costo por mensaje', option_b: 'Costo por mil impresiones', option_c: 'Costo por minuto', option_d: 'Costo por mercado', correct: 1 },
  { question: '¿Que hace display flex?', option_a: 'Oculta el elemento', option_b: 'Activa caja flexible', option_c: 'Agrega borde', option_d: 'Cambia color', correct: 1 },
  { question: '¿Que es el prompting?', option_a: 'Programar', option_b: 'Guiar una IA con instrucciones', option_c: 'Entrenar modelos', option_d: 'Disenar redes', correct: 1 },
]

const SEED_PLAYERS = [
  { name: 'Karla Rios',     init: 'KR', bg: '#c8930a' },
  { name: 'Diego Mendoza',  init: 'DM', bg: '#5a18c7' },
  { name: 'Lucia Torres',   init: 'LT', bg: '#0f6e56' },
  { name: 'Andres Riva',    init: 'AR', bg: '#c0392b' },
  { name: 'Sofia Castro',   init: 'SC', bg: '#6c3483' },
  { name: 'Paulo Milla',    init: 'PM', bg: '#2e86c1' },
  { name: 'Valeria Chavez', init: 'VC', bg: '#a04000' },
  { name: 'Bruno Quiroz',   init: 'BQ', bg: '#1a5276' },
  { name: 'Nadia Flores',   init: 'NF', bg: '#117a65' },
  { name: 'Miguel Alva',    init: 'MA', bg: '#7d6608' },
  { name: 'Camila Zapata',  init: 'CZ', bg: '#4a235a' },
  { name: 'Rodrigo Paz',    init: 'RP', bg: '#1b2631' },
  { name: 'Daniela Vega',   init: 'DV', bg: '#784212' },
  { name: 'Sebastian Mora', init: 'SM', bg: '#0e6251' },
  { name: 'Alejandra Diaz', init: 'AD', bg: '#1a5276' },
] 
const LETTERS = ['A', 'B', 'C', 'D']
const SCREEN  = { MM: 'mm', DUEL: 'duel', RESULT: 'result' }
const TOTAL_Q = 5

export default function Matchmaking() {
  const [searchParams]               = useSearchParams()
  const navigate                     = useNavigate()
  const { user }                     = useAuth()
  const cat                          = searchParams.get('cat') || 'Marketing Digital'

  const [screen, setScreen]          = useState(SCREEN.MM)
  const [mmStatus, setMmStatus]      = useState('Conectando con jugadores activos...')
  const [rivalFound, setRivalFound]  = useState(false)
  const [qs, setQs]                  = useState([])
  const [loadingQs, setLoadingQs]    = useState(true)

  const [qIndex, setQIndex]          = useState(0)
  const [scoreYou, setScoreYou]      = useState(0)
  const [scoreOpp, setScoreOpp]      = useState(0)
  const [timeLeft, setTimeLeft]      = useState(12)
  const [answered, setAnswered]      = useState(false)
  const [chosen, setChosen]          = useState(null)
  const [toast, setToast]            = useState(null)
  const [bgState, setBgState]        = useState('neutral')
  const [history, setHistory]        = useState([])
  const [rival] = useState(
  () => SEED_PLAYERS[Math.floor(Math.random() * SEED_PLAYERS.length)]
)
  const timerRef = useRef(null)

  /* ── CARGAR PREGUNTAS ─────────────────────────────────── */
  useEffect(() => {
  getRandomQuestions(cat, 5).then(data => {
    if (data && data.length >= 5) {
      setQs(data)
    } else {
      setQs(QUESTION_FALLBACK)
    }
    setLoadingQs(false)
  })
}, [cat])

  /* ── MATCHMAKING ──────────────────────────────────────── */
  useEffect(() => {
    const t1 = setTimeout(() => { setMmStatus('Rival encontrado. Preparando duelo...'); setRivalFound(true) }, 2200)
    const t2 = setTimeout(() => setScreen(SCREEN.DUEL), 3800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  /* ── TIMER ────────────────────────────────────────────── */
  useEffect(() => {
    if (screen !== SCREEN.DUEL || answered) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handlePick(-1); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [screen, qIndex, answered])

  /* ── RIVAL ────────────────────────────────────────────── */
  useEffect(() => {
    if (screen !== SCREEN.DUEL || answered) return
    const t = setTimeout(() => {
      if (Math.random() > 0.38) setScoreOpp(s => s + 200)
    }, Math.random() * 5000 + 3000)
    return () => clearTimeout(t)
  }, [screen, qIndex])

  /* ── PICK ─────────────────────────────────────────────── */
  function handlePick(idx) {
    if (answered) return
    clearInterval(timerRef.current)
    setAnswered(true)
    setChosen(idx)
    const correct = qs[qIndex].correct
    const isCorrect = idx === correct
    if (isCorrect) {
      setScoreYou(s => s + 200)
      setToast({ msg: 'Correcto. +200 puntos', type: 'ok' })
      setBgState('correct')
      setHistory(h => { const n=[...h]; n[qIndex]='correct'; return n })
    } else {
      setToast({
        msg: idx === -1
          ? `Tiempo agotado. Era ${LETTERS[correct]}`
          : `Incorrecto. Era ${LETTERS[correct]}`,
        type: 'no'
      })
      setBgState('wrong')
      setHistory(h => { const n=[...h]; n[qIndex]='wrong'; return n })
    }
  }

  /* ── NEXT ─────────────────────────────────────────────── */
function handleNext() {
  setBgState('neutral')
  if (qIndex + 1 >= qs.length) {
    const won     = scoreYou >= scoreOpp
    const xpEarned = won ? 180 : 60
    if (user) {
      saveDuel({
        playerOneId: user.id,
        category:    cat,
        scoreOne:    scoreYou,
        scoreTwo:    scoreOpp,
        winnerId:    won ? user.id : null
      })
      updateStatsAfterDuel(user.id, won, xpEarned)
    }
    setScreen(SCREEN.RESULT)
    return
  }
  setQIndex(i => i + 1)
  setAnswered(false)
  setChosen(null)
  setToast(null)
  setTimeLeft(12)
}

  /* ── OPT CLASS ────────────────────────────────────────── */
  function optClass(i) {
    if (!answered) return styles.opt
    const correct = qs[qIndex].correct
    if (i === correct) return `${styles.opt} ${styles.optOk}`
    if (i === chosen)  return `${styles.opt} ${styles.optNo}`
    return `${styles.opt} ${styles.optDisabled}`
  }

  const win = scoreYou >= scoreOpp

  /* ── LOADING ──────────────────────────────────────────── */
  if (loadingQs) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      minHeight:'100vh', background:'var(--cream)', color:'var(--muted)', fontSize:'13px' }}>
      Preparando preguntas...
    </div>
  )

  return (
    <div className={styles.page}>

      {/* ── MATCHMAKING ── */}
      {screen === SCREEN.MM && (
        <>
          <TopNav right={
            <button className={styles.cancelBtn} onClick={() => navigate('/')}>Cancelar</button>
          }/>
          <main className={styles.mmBody}>
            <h1 className={styles.mmTitle}>BUSCANDO<br/>RIVAL</h1>
            <p className={styles.mmSub}>{mmStatus}</p>
            <div className={styles.arena}>
              <div className={styles.fighter}>
                <div className={`${styles.fAv} ${styles.fAvYou}`}>JR</div>
                <span className={styles.fName}>Tu</span>
              </div>
              <div className={styles.vsBadge}>VS</div>
              <div className={styles.fighter}>
                <div className={`${styles.fAv} ${rivalFound ? styles.fAvFound : styles.fAvOpp}`}>
                  {rivalFound ? rival.init : <span className={styles.dots}><span/><span/><span/></span>}
                </div>
                <span className={styles.fName}>{rivalFound ? rival.name : 'Buscando...'}</span>
              </div>
            </div>
            <div className={styles.mmCatCard}>
              <div className={styles.mmCatLabel}>Categoria</div>
              <div className={styles.mmCatVal}>{cat}</div>
            </div>
          </main>
        </>
      )}

      {/* ── DUEL ── */}
      {screen === SCREEN.DUEL && (
        <div className={`${styles.duelFull} ${styles['bg_' + bgState]}`}>

          <div className={styles.duelTop}>
            <div className={styles.playerBlock}>
              <div className={styles.playerAv} style={{ background: '#7421fc' }}>JR</div>
              <div className={styles.playerName}>Tu</div>
              <div className={styles.playerScore}>{scoreYou}</div>
            </div>
            <div className={styles.timerBlock}>
              <div className={`${styles.timerNum} ${timeLeft <= 4 ? styles.timerRed : ''}`}>
                {timeLeft}
              </div>
              <div className={styles.timerLabel}>seg</div>
            </div>
            <div className={styles.playerBlock} style={{ alignItems: 'flex-end' }}>
              <div className={styles.playerAv} style={{ background: rival.bg }}>{rival.init}</div>
              <div className={styles.playerName}>{rival.name}</div>
              <div className={styles.playerScore}>{scoreOpp}</div>
            </div>
          </div>

          <div className={styles.progressDots}>
            {Array.from({ length: TOTAL_Q }).map((_, i) => (
              <div key={i} className={`${styles.dot}
                ${i === qIndex ? styles.dotActive : ''}
                ${history[i] === 'correct' ? styles.dotCorrect : ''}
                ${history[i] === 'wrong'   ? styles.dotWrong   : ''}
              `}/>
            ))}
          </div>

          <div className={styles.qZone}>
            <div className={styles.qNum}>Pregunta {qIndex + 1} de {TOTAL_Q}</div>
            <p className={styles.qText}>{qs[qIndex]?.question}</p>
          </div>

          <div className={styles.optsZone}>
            {qs[qIndex] && [
              qs[qIndex].option_a,
              qs[qIndex].option_b,
              qs[qIndex].option_c,
              qs[qIndex].option_d,
            ].map((opt, i) => (
              <button key={i} className={optClass(i)} onClick={() => handlePick(i)}>
                <span className={styles.optL}>{LETTERS[i]}</span>
                <span>{opt}</span>
              </button>
            ))}

            {toast && (
              <div className={`${styles.toast} ${toast.type === 'ok' ? styles.toastOk : styles.toastNo}`}>
                {toast.msg}
              </div>
            )}

            {answered && (
              <button className={styles.nextBtn} onClick={handleNext}>
                {qIndex + 1 >= qs.length ? 'VER RESULTADO →' : 'SIGUIENTE →'}
              </button>
            )}
          </div>

        </div>
      )}

      {/* ── RESULT ── */}
      {screen === SCREEN.RESULT && (
        <>
          <TopNav />
          <main className={styles.resultBody}>
            <div className={styles.resultIcon}>
              {win
                ? <Trophy size={40} color="#7421fc" strokeWidth={1.5} />
                : <AlertCircle size={40} color="#1b1b1b" strokeWidth={1.5} />
              }
            </div>
            <h1 className={`${styles.resultTitle} ${win ? styles.win : styles.lose}`}>
              {win ? 'GANASTE' : 'PERDISTE'}
            </h1>
            <p className={styles.resultSub}>
              {win ? `Dominaste ${cat}` : 'Sigue practicando, casi lo logras'}
            </p>

            <div className={styles.resultScores}>
              <div className={`${styles.rsc} ${win ? styles.rscWinner : ''}`}>
                <div className={styles.rscName}>Tu</div>
                <div className={styles.rscPts}>{scoreYou}</div>
                <div className={styles.rscOk}>{Math.round(scoreYou / 200)}/5 correctas</div>
              </div>
              <div className={`${styles.rsc} ${!win ? styles.rscWinner : ''}`}>
                <div className={styles.rscName}>{rival.name}</div>
                <div className={styles.rscPts}>{scoreOpp}</div>
                <div className={styles.rscOk}>{Math.round(scoreOpp / 200)}/5 correctas</div>
              </div>
            </div>

            <div className={styles.xpBlock}>
              <div className={styles.xpNum}>+{win ? 180 : 60} XP</div>
              <div>
                <div className={styles.xpLabel}>Experiencia ganada</div>
                <div className={styles.xpSub}>{win ? 'Racha: 3 victorias seguidas' : 'Sigue jugando para subir'}</div>
              </div>
            </div>

            <div className={styles.ctaCard} onClick={() => navigate('/ranking')}>
              <div className={styles.ctaIcon}>
                <Trophy size={18} color="#7421fc" strokeWidth={1.5} />
              </div>
              <div>
                <div className={styles.ctaTitle}>Sube al top 10 del ranking</div>
                <div className={styles.ctaSub}>{cat} Avanzado — Artiva</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{marginLeft:'auto',flexShrink:0}}>
                <path d="M6 4l4 4-4 4" stroke="#c4beb6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <div className={styles.resultCtas}>
              <button className={styles.btnMain} onClick={() => navigate('/')}>JUGAR OTRO DUELO</button>
              <button className={styles.btnGhost} onClick={() => navigate('/ranking')}>Ver ranking</button>
            </div>
          </main>
          <BottomNav />
        </>
      )}
    </div>
  )
}
