import type { LyricLine } from '@/types'

export const singleTrackPlaceholderId = '__single_track'

export interface WebSearchTrackItem {
  id: string
  song_name: string
  song_name_original: string
  album_name: string
  artist: string
  duration: number
}

const screenApiHost = 'https://mayscreen-api.ddiu.site'

export const getTrackListByKeyword = async (keyword: string) => {
  const res = await fetch(`${screenApiHost}/v1/search?keyword=${keyword}`)
  if (!res.ok) {
    console.error(res.statusText)
    return null
  }
  const data = await res.json()
  if (data.error) {
    console.error(data.error)
    return []
  }
  return (data.data?.list || []) as WebSearchTrackItem[]
}

export const getLyricBySongId = async (songId: string) => {
  const res = await fetch(`${screenApiHost}/v1/lyric?id=${songId}`)
  if (!res.ok) {
    console.error(res.statusText)
    return null
  }
  const data = await res.json()
  if (data.error) {
    console.error(data.error)
    return null
  }
  return (data.data?.content || []) as string
}
