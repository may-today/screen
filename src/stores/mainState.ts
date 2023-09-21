import { atom } from 'nanostores'
import type { ExtraView } from '@/types'

export const $currentSongId = atom<string | null>(null)
export const $blackScreen = atom<boolean>(false)
export const $autoPlay = atom<boolean>(false)
export const $extraView = atom<ExtraView>(null)

export const $currentTime = atom<number>(0)
export const $isTimerRunning = atom<boolean>(false)