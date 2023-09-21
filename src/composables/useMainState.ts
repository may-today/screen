import { createSignal } from 'solid-js'
import { $currentSongId, $blackScreen, $autoPlay, $extraView } from '@/stores/mainState'
import { $currentTimelineData } from '@/stores/data'
import { sendAction } from '@/logic/connect'
import { $timeServer } from './useTimeServer'
import type { StateAction, ExtraView, TimelineData } from '@/types'

export const useMainState = () => {
  const [currentLyricLine, setCurrentLyricLine] = createSignal<TimelineData | null>(null)

  $timeServer.$currentTime.subscribe((time) => {
    const timeline = $currentTimelineData.get()
    if (!timeline) return
    if (timeline.has(time)) {
      const line = timeline.get(time)
      console.log(line)
      setCurrentLyricLine(line!)
    }
  })

  const handleAction = (action: StateAction) => {
    console.log('handleAction', action.type, action.payload)
    sendAction(action)
    switch (action.type) {
      case 'set_id':
        setSongId(action.payload)
        break
      case 'set_time':
        setTime(action.payload)
        break
      case 'set_start_pause':
        setStartPause(action.payload)
        break
      case 'show_next_line':
        showNextLineLyric()
        break
      case 'set_screen_off':
        setScreenOff(action.payload)
        break
      case 'set_auto_play':
        setAutoPlay(action.payload)
        break
      case 'set_extra':
        setExtraView(action.payload)
        break
    }
  }

  const setSongId = (id: string | null) => {
    $currentSongId.set(id)
    $timeServer.clear()
    setCurrentLyricLine(null)
  }

  const setTime = (time: number) => {
    if (!$currentSongId.get()) {
      return
    }
    $timeServer.$currentTime.set(time)
    if ($autoPlay.get()) {
      $timeServer.pause()
      $timeServer.start()
    }
  }

  const setStartPause = (status: 'start' | 'pause') => {
    if (!$currentSongId.get()) {
      return
    }
    if (status === 'start') {
      $timeServer.start()
    } else if (status === 'pause') {
      $timeServer.pause()
    }
  }

  const setScreenOff = (status: boolean) => {
    $blackScreen.set(status)
  }

  const setAutoPlay = (status: boolean) => {
    $autoPlay.set(status)
    if (!$currentSongId.get()) {
      return
    }
    if (status) {
      $timeServer.start()
    } else {
      $timeServer.pause()
    }
  }

  const setExtraView = (view: ExtraView) => {
    $extraView.set(view)
  }

  const showNextLineLyric = () => {
    const timeline = $currentTimelineData.get() || new Map()
    const timelineTimeList = Array.from(timeline.keys())
    const currentTime = $timeServer.$currentTime.get()
    const nextTime = timelineTimeList.find((time) => time > currentTime)
    if (nextTime) {
      setTime(nextTime)
    } else {
      $timeServer.clear()
    }
  }

  return {
    currentLyricLine,
    handleAction,
  } as const
}

export const $mainState = useMainState()