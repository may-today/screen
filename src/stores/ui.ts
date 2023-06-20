import { atom } from 'nanostores'

export const $currentSongId = atom<string | null>(null)
export const $sidebarOpen = atom(false)