export interface SongMeta {
  title: string
  slug: string
  meta: {
    year?: number
    album?: string
    banlam: boolean
    length?: number
    light: boolean
  }
}

export type SongDetail = SongMeta & {
  index: string
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

export interface StateActionBase {
  type: string
}
export interface StateActionSyncState extends StateActionBase {
  type: 'sync_state'
  payload: StateSnapshot
}
export interface StateActionSetId extends StateActionBase {
  type: 'set_id'
  payload: string | null
}
export interface StateActionSetTime extends StateActionBase {
  type: 'set_time'
  payload: number
}
export interface StateActionSetStartPause extends StateActionBase {
  type: 'set_start_pause'
  payload: 'start' | 'pause'
}
export interface StateActionShowNextLine extends StateActionBase {
  type: 'show_next_line'
  payload: null
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
export type StateAction = StateActionSyncState
  | StateActionSetId
  | StateActionSetTime
  | StateActionSetStartPause
  | StateActionShowNextLine
  | StateActionSetScreenOff
  | StateActionSetAutoPlay
  | StateActionSetExtraView

export interface StateSnapshot {
  time: number
  state: {
    currentSongId: string | null
    blackScreen: boolean
    autoPlay: boolean
    extraView: ExtraView
    currentTime: number
    isTimerRunning: boolean
  }
}
