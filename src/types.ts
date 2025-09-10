export interface SongMeta {
  title: string
  slug: string
  index: string
  meta: {
    artist?: string
    year?: number
    album?: string
    lyricist?: string
    composer?: string
    banlam?: boolean
    length?: number
    showTitle?: string
  }
}

export interface GroupListItem {
  index: string
  list: SongMeta[]
}

export type SongDetail = SongMeta & {
  detail: LyricLine[]
}

export interface LyricLine {
  time: number
  text: string
  isHighlight: boolean
  toneText?: string
  toneText2?: string
}

export interface SearchItem {
  slug: string
  data: SongDetail
  matchType: 'title' | 'lyric'
  matchLines: string
  highlightLines: string
}

export interface TimelineData {
  index: number
  startTime: number
  data: LyricLine
  duration: number
}

export type ConnectStatus = 'not-ready' | 'ready' | 'connecting' | 'connected' | 'error'
export type DataDownloadStatus = 'ready' | 'downloading' | 'done' | 'error'

export type ExtraView = {
  type: 'image' | 'text'
  data: string
} | null

export interface FavListExportData {
  favDict: Record<string, string>
  favIdList: string[]
  exportTime: string
}

export interface StateActionBase {
  type: string
}
export interface StateActionSyncState extends StateActionBase {
  type: 'sync_state'
  payload: StateSnapshot
}
export interface StateActionSetDataset extends StateActionBase {
  type: 'set_dataset'
  payload: string
}
export interface StateActionSetId extends StateActionBase {
  type: 'set_id'
  payload: string | null
}
export interface StateActionSetLyricLine extends StateActionBase {
  type: 'set_lyric_index'
  payload: number
}
export interface StateActionSetStartPause extends StateActionBase {
  type: 'set_start_pause'
  payload: 'start' | 'pause'
}
export interface StateActionShowPrevNextLine extends StateActionBase {
  type: 'show_prev_next_line'
  payload: 'prev' | 'next'
}
export interface StateActionSetScreenOff extends StateActionBase {
  type: 'set_screen_off'
  payload: boolean
}
export interface StateActionSetAutoPlay extends StateActionBase {
  type: 'set_auto_play'
  payload: boolean
}
export interface StateActionSetExtraView extends StateActionBase {
  type: 'set_extra'
  payload: ExtraView
}
export interface StateActionSetSingleLyric extends StateActionBase {
  type: 'set_single_track'
  payload: SongDetail | null
}
export interface StateActionSetFavData extends StateActionBase {
  type: 'set_fav_data'
  payload: FavListExportData
}
export type StateAction = StateActionSyncState
  | StateActionSetDataset
  | StateActionSetId
  | StateActionSetLyricLine
  | StateActionSetStartPause
  | StateActionShowPrevNextLine
  | StateActionSetScreenOff
  | StateActionSetAutoPlay
  | StateActionSetExtraView
  | StateActionSetSingleLyric
  | StateActionSetFavData

export interface StateSnapshot {
  time: number
  state: {
    dataset: string
    currentSongId: string | null
    blackScreen: boolean
    autoPlay: boolean
    extraView: ExtraView
    singleTrack: SongDetail | null
    currentTime: number
    isTimerRunning: boolean
    currentLyricIndex: number
  }
}
