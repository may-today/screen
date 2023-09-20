import { createSignal } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { $currentSongId, $blackScreen, $extraView } from '@/stores/mainState'
import { $currentTimelineData } from '@/stores/data'
import { sendAction } from '@/logic/connect'
import { $timeServer } from './useTimeServer'
import type { StateAction, ExtraView, TimelineData } from '@/types'

export const useMainState = () => {
  const currentTimelineData = useStore($currentTimelineData)
  const [currentLyricLine, setCurrentLyricLine] = createSignal<TimelineData | null>(null)

  $timeServer.setOnUpdate((time) => {
    const timeline = currentTimelineData()
    if (!timeline) return
    if (timeline.has(time)) {
      const line = timeline.get(time)
      console.log(line)
      setCurrentLyricLine(line!)
    }
  })

  const handleAction = (action: StateAction) => {
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
      case 'set_screen_off':
        setScreenOff(action.payload)
        break
      case 'set_extra':
        setExtraView(action.payload)
        break
    }
  }

  const setSongId = (id: string | null) => {
    $currentSongId.set(id)
    $timeServer.clear()
  }

  const setTime = (time: number) => {
    $timeServer.setCurrentTime(time)
    $timeServer.pause()
    $timeServer.start()
  }

  const setStartPause = (status: 'start' | 'pause') => {
    if (status === 'start') {
      $timeServer.start()
    } else if (status === 'pause') {
      $timeServer.pause()
    }
  }

  const setScreenOff = (status: boolean) => {
    $blackScreen.set(status)
  }

  const setExtraView = (view: ExtraView) => {
    $extraView.set(view)
  }

  return {
    currentLyricLine,
    handleAction,
  } as const
}

export const $mainState = useMainState()