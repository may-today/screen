import type { LyricLine, TimelineData } from '@/types'

export const parseLyricTimeline = (lyrics?: LyricLine[]) => {
  if (!lyrics) return []
  const timelineList = [] as TimelineData[]
  for (let i = 0; i < lyrics.length; i++) {
    const current = lyrics[i]
    const next = lyrics[i + 1]
    const startTime = current.time
    const duration = (startTime >= 0 && next) ? next.time - startTime : 0
    timelineList.push({
      index: i,
      startTime,
      data: current,
      duration: duration > 0 ? duration : 0,
    })
  }
  return timelineList
}
