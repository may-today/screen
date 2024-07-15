import { atom } from 'nanostores'
import type { ExtraView, SongDetail } from '@/types'

export const $dataset = atom<string>('mayday')
export const $currentSongId = atom<string | null>(null)
export const $blackScreen = atom<boolean>(false)
export const $autoPlay = atom<boolean>(false)
export const $extraView = atom<ExtraView>(null)
export const $singleTrack = atom<SongDetail | null>(null)

export const $currentTime = atom<number>(0)
export const $currentLyricIndex = atom<number>(-1)
export const $isTimerRunning = atom<boolean>(false)
export const $stickDevices = atom<BluetoothDevice[]>([])
