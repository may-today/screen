import { atom, map, action, computed } from 'nanostores'
import { $statusText } from './ui'
import { $currentSongId, $singleTrack } from './coreState'
import { parseLyricTimeline } from '@/logic/lyric'
import { singleTrackPlaceholderId } from '@/logic/singleTrack'
import type { SongMeta, SongDetail, DataDownloadStatus } from '@/types'

export const $allDataDict = map<Record<string, SongDetail>>({})
export const $updateTime = atom<string | null>(null)
export const $groupMetaList = map<Record<string, SongMeta[]>>({})
export const $dataDownloadStatus = atom<DataDownloadStatus>('ready')

export const $currentSongData = computed([$currentSongId, $allDataDict, $singleTrack], (songId, dict, singleTrack) => {
  if (songId === singleTrackPlaceholderId) {
    return singleTrack
  }
  if (!songId) {
    return null
  }
  console.log('dict', dict[songId])
  return dict[songId] || null
})

export const $currentTimelineData = computed([$currentSongData], (songData) => {
  if (!songData) return null
  if (songData.detail.find((line) => line.time < 0)) {
    return null
  }
  return parseLyricTimeline(songData.detail)
})

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
