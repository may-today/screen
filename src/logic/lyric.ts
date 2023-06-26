import type { LyricLine, TimelineData } from '@/types'

export const parseLyricTimeline = (lyrics?: LyricLine[]) => {
  if (!lyrics) return null
  const lyricMap = new Map<number, TimelineData>()
  for (let i = 0; i < lyrics.length; i++) {
    const current = lyrics[i]
    const next = lyrics[i + 1]
    const startTime = current.time
    const duration = next ? next.time - startTime : 0
    lyricMap.set(startTime, {
      startTime,
      data: current,
      duration: duration > 0 ? duration : 0,
    })
  }
  return lyricMap
}
