import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import styles from './Login.module.css'

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode]       = useState('login') // 'login' | 'register'
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (mode === 'register') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
      })
      if (error) { setError(error.message); setLoading(false); return }
      navigate('/')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      navigate('/')
    }
  }

  return (
    <div className={styles.page}>

      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.logo}>SKILL<span>DUEL</span></div>
        <div className={styles.logoSub}>by Artiva Latam</div>
      </div>

      {/* HERO */}
      <div className={styles.hero}>
        <div className={styles.eyebrow}>Demuestra lo que sabes</div>
        <h1 className={styles.heroTitle}>DUELA<br/><em>TUS</em><br/>SKILLS</h1>
        <p className={styles.heroSub}>60 seg · 5 preguntas · 1 ganador</p>
      </div>

      {/* FORM CARD */}
      <div className={styles.card}>

        {/* TABS */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${mode === 'login' ? styles.tabOn : ''}`}
            onClick={() => { setMode('login'); setError(null) }}
          >
            Ingresar
          </button>
          <button
            className={`${styles.tab} ${mode === 'register' ? styles.tabOn : ''}`}
            onClick={() => { setMode('register'); setError(null) }}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>

          {mode === 'register' && (
            <div className={styles.field}>
              <label className={styles.label}>Nombre</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Contrasena</label>
            <input
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button className={styles.btnMain} type="submit" disabled={loading}>
            {loading ? 'Cargando...' : mode === 'login' ? 'INGRESAR' : 'CREAR CUENTA'}
          </button>

        </form>
      </div>

    </div>
  )
}