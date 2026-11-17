import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/* ── AUTH ───────────────────────────────────────────────── */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/* ── PERFIL ─────────────────────────────────────────────── */
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) console.error(error)
  return data
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) console.error(error)
  return { data, error }
}

/* ── RANKING ────────────────────────────────────────────── */
export async function getRanking(limit = 20) {
  const { data, error } = await supabase
    .from('ranking')
    .select('*')
    .order('position', { ascending: true })
    .limit(limit)
  if (error) console.error(error)
  return data || []
}

/* ── DUELOS ─────────────────────────────────────────────── */
// Guarda el duelo (contra bot) y suma duelos, victorias, XP, racha, nivel y
// estadisticas por categoria en el servidor, de forma atomica (funcion finish_duel).
// Devuelve { data, error }. En exito, data = { duel_id, won, xp_earned, new_xp, new_level, new_streak }
export async function finishDuel({ category, scoreOne, scoreTwo, opponentName }) {
  const { data, error } = await supabase.rpc('finish_duel', {
    p_category:      category,
    p_score_one:     scoreOne,
    p_score_two:     scoreTwo,
    p_opponent_name: opponentName ?? null
  })
  if (error) { console.error('finish_duel:', error); return { data: null, error } }
  // La funcion devuelve una tabla de una sola fila
  return { data: Array.isArray(data) ? data[0] : data, error: null }
}
/* ── PREGUNTAS ──────────────────────────────────────────── */
// Preguntas al azar de TODA la categoria (el orden aleatorio lo hace la base de datos)
export async function getRandomQuestions(category, limit = 5) {
  const { data, error } = await supabase.rpc('get_random_questions', {
    cat: category,
    num: limit
  })
  if (error) { console.error('Error questions:', error); return [] }
  return data || []
}
/* ── HISTORIAL ──────────────────────────────────────────── */
export async function getDuelHistory(userId, limit = 10) {
  const { data, error } = await supabase
    .from('duels')
    .select('*')
    .eq('player_one', userId)
    .order('played_at', { ascending: false })
    .limit(limit)
  if (error) { console.error(error); return [] }
  return data || []
}
// Estadisticas por categoria del usuario: [{ category, duels_played, duels_won, xp }]
export async function getCategoryStats(userId) {
  const { data, error } = await supabase
    .from('category_stats')
    .select('category, duels_played, duels_won, xp')
    .eq('user_id', userId)
  if (error) { console.error(error); return [] }
  return data || []
}
export async function getRankingByCategory(category, limit = 20) {
  const { data, error } = await supabase
    .from('ranking_by_category')
    .select('*')
    .eq('category', category)
    .order('position', { ascending: true })
    .limit(limit)
  if (error) { console.error(error); return [] }
  return data || []
}
/* ── MATCHMAKING QUEUE ──────────────────────────────────── */
export async function joinQueue(userId, category) {
  // Limpiar entrada previa del mismo usuario
  await supabase
    .from('matchmaking_queue')
    .delete()
    .eq('user_id', userId)

  // Agregar a la cola
  const { data, error } = await supabase
    .from('matchmaking_queue')
    .insert({ user_id: userId, category })
    .select()
    .single()
  if (error) { console.error(error); return null }
  return data
}

export async function findOpponent(userId, category) {
  const { data, error } = await supabase
    .from('matchmaking_queue')
    .select('*, profiles(full_name, avatar_initials)')
    .eq('category', category)
    .neq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
  if (error) { console.error(error); return null }
  return data?.[0] || null
}

export async function leaveQueue(userId) {
  await supabase
    .from('matchmaking_queue')
    .delete()
    .eq('user_id', userId)
}