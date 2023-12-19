import { $allDataDict, $groupMetaList, setDataDownloadStatus } from '@/stores/data'
import type { SongMeta, SongDetail, SearchItem } from '@/types'
import { datasetConfig } from '@/assets/dataset'

const saveAndParseDetailList = (list: SongDetail[]) => {
  const dict = generateDataDict(list)
  $allDataDict.set(dict)
  const group = generateMetaGroupList(list)
  $groupMetaList.set(group)
}

const generateDataDict = (list: SongDetail[]) => {
  const dict: Record<string, SongDetail> = {}
  list.forEach(song => {
    dict[song.slug] = song
  })
  return dict
}

const generateMetaGroupList = (list: SongDetail[]) => {
  const indexGroup: Record<string, SongMeta[]> = {}
  list.forEach((song) => {
    if (!indexGroup[song.index]) {
      indexGroup[song.index] = []
    }
    const meta = {
      title: song.title,
      slug: song.slug,
      meta: song.meta,
    } as SongMeta
    indexGroup[song.index].push(meta)
  })
  return indexGroup
}

export const loadStorageData = async (dataset: string) => {
  const allSongData = localStorage.getItem(`data_${dataset}`) || null
  if (!allSongData) {
    saveAndParseDetailList([])
    return
  }
  const allSongDataParsed = JSON.parse(allSongData)
  saveAndParseDetailList(allSongDataParsed)
}

export const fetchAndUpdateData = async (dataset: string) => {
  setDataDownloadStatus('downloading')
  const datasetUrl = datasetConfig[dataset]?.downUrl || null
  if (!datasetUrl) {
    setDataDownloadStatus('error')
    return false
  }
  const allSongData: SongDetail[] = await fetch(datasetUrl).then(res => res.json()).catch(() => null)
  if (!allSongData) {
    setDataDownloadStatus('error')
    return false
  }
  setDataDownloadStatus('done')
  saveAndParseDetailList(allSongData)
  localStorage.setItem(`data_${dataset}`, JSON.stringify(allSongData))
  return true
}

export const searchByString = (str: string, list: SongDetail[]) => {
  const searchValue = str.replace(/\s*/g,'').toLowerCase()
  const filteredList = list.map(item => {
    const pureLyricArr = item.detail.map(line => line.text)
    const lyricLinesText = pureLyricArr.join('|').replace(/\s*/g,'').toLowerCase()
    if (!item.title.toLowerCase().includes(searchValue) && !lyricLinesText.includes(searchValue)) {
      return null
    }
    const matchType = item.title.toLowerCase().includes(searchValue) ? 'title' : 'lyric'
    const matchLinesBefore = pureLyricArr.filter(line => line.replace(/\s*/g,'').toLowerCase().includes(searchValue))
    const matchLines = Array.from(new Set(matchLinesBefore)).join('/')
    const highlightLines = item.detail.filter(line => line.isHighlight).map(line => line.text).join('/')
    return {
      slug: item.slug,
      data: item,
      matchType,
      matchLines,
      highlightLines,
    } as SearchItem
  }).filter((item) => item !== null) as SearchItem[]
  filteredList.sort((a, b) => {
    if (a.matchType === 'title' && b.matchType === 'lyric') {
      return -1
    }
    if (a.matchType === 'lyric' && b.matchType === 'title') {
      return 1
    }
    return 0
  })
  return filteredList
}