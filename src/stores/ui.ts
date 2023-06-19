import { atom } from 'nanostores'
import type { SongMeta } from '@/types'

export const $currentSongId = atom<string | null>(null)
export const $sidebarOpen = atom(false)