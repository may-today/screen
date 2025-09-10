import { atom, computed } from 'nanostores'
import type { SongDetail } from '@/types'

export const $favDict = atom<Record<string, string>>({})
export const $favIdList = atom<string[]>([])

export const $favMetaList = computed([$favDict, $favIdList], (favDict, favIdList) => {
  const metaList = {} as Record<string, {
    title: string
    detailStr: string
  }>
  favIdList.forEach(slug => {
    if (favDict[slug]) {
      const song = JSON.parse(favDict[slug]) as SongDetail
      metaList[slug] = {
        title: song.title || '',
        detailStr: JSON.stringify(song) || '',
      }
    }
  })

  return metaList
})

export const addFav = (song: SongDetail | null) => {
  if (!song) {
    return
  }
  const favDict = $favDict.get()
  favDict[song.slug] = JSON.stringify(song)
  $favDict.set(favDict)
  $favIdList.set([...$favIdList.get(), song.slug])
}

export const removeFav = (slug: string) => {
  const favDict = $favDict.get()
  delete favDict[slug]
  $favDict.set(favDict)
  $favIdList.set($favIdList.get().filter(id => id !== slug))
}
