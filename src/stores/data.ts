import { atom, map, action, computed } from 'nanostores'
import { $currentSongId, $statusText } from './ui'
import type { SongMeta, SongDetail, SearchItem, DataDownloadStatus } from '@/types'

export const $allDataDict = map<Record<string, SongDetail>>({})
export const $updateTime = atom<string | null>(null)
export const $groupMetaList = map<Record<string, SongMeta[]>>({})
export const $dataDownloadStatus = atom<DataDownloadStatus>('ready')

export const $currentSongData = computed([$currentSongId, $allDataDict], (songId, dict) => {
  if (!songId) return null
  console.log('dict', dict[songId])
  return dict[songId] || null
})

export const loadStorageData = () => {
  const allSongData = localStorage.getItem('allSongData')
  const lastUpdateTime = localStorage.getItem('lastUpdateTime')
  if (!allSongData) {
    return
  }
  const allSongDataParsed = JSON.parse(allSongData)
  saveAndParseDetailList(allSongDataParsed, lastUpdateTime)
}

export const fetchAndUpdateData = async () => {
  setDataDownloadStatus('downloading')
  const allSongData: SongDetail[] = await fetch('https://mayday.blue/api/v1/detail-list').then(res => res.json()).catch(() => null)
  if (allSongData) {
    setDataDownloadStatus('done')
    const currentUpdateTime = new Date().toISOString()
    saveAndParseDetailList(allSongData, currentUpdateTime)
    localStorage.setItem('allSongData', JSON.stringify(allSongData))
    localStorage.setItem('lastUpdateTime', currentUpdateTime)
  } else {
    setDataDownloadStatus('error')
  }
}

export const setDataDownloadStatus = action($dataDownloadStatus, 'setDataDownloadStatus', (store, status: DataDownloadStatus) => {
  store.set(status)
  const statusText = getStatusTextByStatus(status)
  $statusText.set(statusText)
})

const getStatusTextByStatus = (status: DataDownloadStatus) => {
  return {
    ready: '',
    downloading: '正在下载歌词数据',
    done: '歌词数据下载完成',
    error: '歌词数据下载失败',
  }[status]
}

export const saveAndParseDetailList = (list: SongDetail[], updateTime: string | null) => {
  if (updateTime) {
    $updateTime.set(updateTime)
  }
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