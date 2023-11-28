export interface SongMeta {
  title: string
  slug: string
  meta: {
    artist?: string
    year?: number
    album?: string
    banlam?: boolean
    length?: number
  }
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
export type StateAction = StateActionSyncState
  | StateActionSetId
  | StateActionSetTime
  | StateActionSetStartPause
  | StateActionShowPrevNextLine
  | StateActionSetScreenOff
  | StateActionSetAutoPlay
  | StateActionSetExtraView
  | StateActionSetSingleLyric

export interface StateSnapshot {
  time: number
  state: {
    currentSongId: string | null
    blackScreen: boolean
    autoPlay: boolean
    extraView: ExtraView
    singleTrack: SingleTrackItem
    currentTime: number
    isTimerRunning: boolean
  }
}
