import { atom } from 'nanostores'
import type { SongDetail } from '@/types'

export const $favDict = atom<Record<string, SongDetail>>({})
export const $favIdList = atom<string[]>([])

export const addFav = (song: SongDetail | null) => {
  console.log('addFav', song)
  if (!song) {
    return
  }
  const favDict = $favDict.get()
  favDict[song.slug] = song
  $favDict.set(favDict)
  $favIdList.set([...$favIdList.get(), song.slug])
}

export const removeFav = (slug: string) => {
  const favDict = $favDict.get()
  delete favDict[slug]
  $favDict.set(favDict)
  $favIdList.set($favIdList.get().filter(id => id !== slug))
}
