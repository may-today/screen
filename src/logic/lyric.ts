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

export const parseRawLRCFile = (content: string) => {
  const lyricLines = content.split('\n').map(line => {
    if (!line) return undefined
    // [time](highlight)text [toneText(|toneText2)]
    // [00:11]!我的心内感觉 [Gua e sim-lai kam-kak|wa e xin nai gan ga]
    const timeLineRegex = /^\[\d{2}:\d{2}(\.\d+)?\]/
    const toneTextRegex = /\[([^\]]+)\]$/
    const time = line.match(timeLineRegex)?.[0]
    const timeSecondRaw = Number(time?.match(/\d{2}:\d{2}(\.\d+)?/)?.[0].split(':').reduce((acc, cur, i) => acc + Math.floor(Number(cur)) * Math.pow(60, 1 - i), 0))
    const timeSecond = (isNaN(timeSecondRaw) || timeSecondRaw < 0) ? -1 : timeSecondRaw
    const rawText = line.replace(timeLineRegex, '').trim()
    const isHighlight = rawText.startsWith('!')
    const toneTextRaw = rawText.match(toneTextRegex)?.[1]
    const hasToneText2 = toneTextRaw?.includes('|')
    const toneText = hasToneText2 ? toneTextRaw?.split('|')[0] : toneTextRaw
    const toneText2 = hasToneText2 ? toneTextRaw?.split('|')[1] : undefined
    const text = toneText ? rawText.replace(toneTextRegex, '') : rawText
    return {
      time: timeSecond,
      text: timeSecond === 0 ? '' : text.replace(/^\!/, '').replaceAll('  ', '\u00a0\u00a0').trim(),
      isHighlight,
      toneText: toneText?.replaceAll('  ', '\u00a0\u00a0') || undefined,
      toneText2: toneText2?.replaceAll('  ', '\u00a0\u00a0') || undefined,
    } as LyricLine
  }).filter(line => line) as LyricLine[]
  return lyricLines
}
