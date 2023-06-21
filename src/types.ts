export interface SongMeta {
  title: string
  slug: string
  meta: {
    year?: number
    banlam?: boolean
  }
  content: string
  detail: LyricLine[]
}

export interface LyricLine {
  time: number
  text: string
  isHighlight: boolean
  toneText?: string
  toneText2?: string
}

export interface SongGroup {
  key: string
  list: SongMeta[]
}

export interface TimelineData {
  startTime: number
  data: LyricLine
  duration: number
}

export type ConnectState = 'none' | 'connected' | 'error'

export interface PeerActionBase {
  type: string
  value: any
}
export interface PeerActionSetId extends PeerActionBase {
  type: 'set_id'
  value: string | null
}
export interface PeerActionSetTime extends PeerActionBase {
  type: 'set_time'
  value: number
}
export interface PeerActionSetStartPause extends PeerActionBase {
  type: 'set_start_pause'
  value: 'start' | 'pause'
}
export interface PeerActionSetScreenOff extends PeerActionBase {
  type: 'set_screen_off'
  value: boolean
}
export interface PeerActionSetText extends PeerActionBase {
  type: 'set_text'
  value: string
}
export interface PeerActionSetImage extends PeerActionBase {
  type: 'set_image'
  value: number
}
export type PeerAction = PeerActionSetId | PeerActionSetTime | PeerActionSetStartPause | PeerActionSetScreenOff | PeerActionSetText | PeerActionSetImage