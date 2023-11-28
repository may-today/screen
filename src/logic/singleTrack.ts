import type { LyricLine } from '@/types'

export const singleTrackPlaceholderId = '__single_track'

export interface WebSearchTrackItem {
  id: string
  name: string
  duration: number
  artists: {
    id: string
    name: string
  }[]
  artists_str: string
  album: {
    id: string
    name: string
    image: string
  }
}

const screenApiHost = 'https://screen-api.mayday.blue'

export const getTrackListByKeyword = async (keyword: string) => {
  const res = await fetch(`${screenApiHost}/song_search?q=${keyword}`)
  const data = await res.json()
  if (data.error) {
    console.error(data.error)
    return []
  }
  return (data.tracks || []) as WebSearchTrackItem[]
}

export const getLyricByTrackId = async (trackId: string) => {
  const res = await fetch(`${screenApiHost}/get_lyric?trackid=${trackId}`)
  const data = await res.json()
  if (data.error) {
    console.error(data.error)
    return null
  }
  return (data.lines || []) as LyricLine[]
}
