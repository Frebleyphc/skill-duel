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
  return data
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
export async function saveDuel({ playerOneId, category, scoreOne, scoreTwo, winnerId }) {
  const { data, error } = await supabase
    .from('duels')
    .insert({
      player_one: playerOneId,
      player_two: playerOneId, // por ahora mismo usuario hasta tener matchmaking real
      category,
      score_one: scoreOne,
      score_two: scoreTwo,
      winner: winnerId
    })
    .select()
    .single()
  if (error) console.error(error)
  return data
}

export async function updateStatsAfterDuel(userId, won, xpEarned) {
  const profile = await getProfile(userId)
  if (!profile) return

  await updateProfile(userId, {
    duels_played:   profile.duels_played + 1,
    duels_won:      profile.duels_won + (won ? 1 : 0),
    xp:             profile.xp + xpEarned,
    current_streak: won ? profile.current_streak + 1 : 0,
    level:          Math.floor((profile.xp + xpEarned) / 500) + 1
  })
}
/* ── PREGUNTAS ──────────────────────────────────────────── */
export async function getRandomQuestions(category, limit = 5) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('category', category)
    .limit(limit * 3)
  if (error) { console.error('Error questions:', error); return [] }
  if (!data || data.length === 0) return []
  const shuffled = data.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, limit)
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