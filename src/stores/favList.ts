import { atom, computed } from 'nanostores'
import type { SongDetail, FavListExportData } from '@/types'

export const $favDict = atom<Record<string, string>>({})
export const $favIdList = atom<string[]>([])

export const $favMetaList = computed([$favDict, $favIdList], (favDict, favIdList) => {
  const metaList = {} as Record<
    string,
    {
      title: string
      detailStr: string
    }
  >
  favIdList.forEach((slug) => {
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
  persistentFav()
}

export const removeFav = (slug: string) => {
  const favDict = $favDict.get()
  delete favDict[slug]
  $favDict.set(favDict)
  $favIdList.set($favIdList.get().filter((id) => id !== slug))
  persistentFav()
}

export const clearFav = () => {
  $favDict.set({})
  $favIdList.set([])
  persistentFav()
}

const persistentFav = () => {
  localStorage.setItem('favDict', JSON.stringify($favDict.get()))
  localStorage.setItem('favIdList', JSON.stringify($favIdList.get()))
}

export const loadPersistentFav = () => {
  const favDictStr = localStorage.getItem('favDict')
  const favIdListStr = localStorage.getItem('favIdList')
  if (!favDictStr || !favIdListStr) {
    return
  }
  try {
    const favDict = JSON.parse(favDictStr)
    const favIdList = JSON.parse(favIdListStr)
    $favDict.set(favDict)
    $favIdList.set(favIdList)
  } catch {}
}

export const generateFavListExportData = () => {
  return {
    favDict: $favDict.get(),
    favIdList: $favIdList.get(),
    exportTime: new Date().toISOString(),
  }
}

export const importFavListExportData = (data: FavListExportData) => {
  if (data.favDict && data.favIdList) {
    $favDict.set(data.favDict)
    $favIdList.set(data.favIdList)
    persistentFav()
    return true
  }
  return false
}

export const exportFavList = () => {
  const favData = generateFavListExportData()
  const dataStr = JSON.stringify(favData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `mayscreen-fav-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const importFavList = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const favData = JSON.parse(content) as FavListExportData
        if (importFavListExportData(favData)) {
          resolve(true)
        } else {
          resolve(false)
        }
      } catch {
        resolve(false)
      }
    }
    reader.onerror = () => resolve(false)
    reader.readAsText(file)
  })
}
