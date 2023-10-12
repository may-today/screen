import { createSignal } from 'solid-js'
import { $currentSongId, $blackScreen, $autoPlay, $extraView } from '@/stores/coreState'
import { $currentTimelineData, $currentSongData } from '@/stores/data'
import { sendAction } from '@/logic/connect'
import { $timeServer } from './useTimeServer'
import type { StateAction, ExtraView, TimelineData, StateSnapshot } from '@/types'

export const useCoreState = () => {
  const [currentLyricLine, setCurrentLyricLine] = createSignal<TimelineData | null>(null)
  const [stateTime, setStateTime] = createSignal(0)

  $timeServer.$currentTime.subscribe((time) => {
    const timeline = $currentTimelineData.get()
    if (!timeline) return
    if (timeline.has(time)) {
      const line = timeline.get(time)
      console.log(line)
      setCurrentLyricLine(line!)
    }
    const allSongLength = $currentSongData.get()?.meta?.length || Number(Array.from(timeline.keys()).pop()) + 20
    if (time >= allSongLength!) {
      $timeServer.clear()
    }
  })

  const handleAction = (action: StateAction) => {
    console.log('handleAction', action.type, action.payload)
    if (action.type !== 'sync_state') {
      setStateTime(Date.now())
    }
    switch (action.type) {
      case 'sync_state':
        pullSnapShot(action.payload)
        break
      case 'set_id':
        setSongId(action.payload)
        break
      case 'set_time':
        setTime(action.payload)
        break
      case 'set_start_pause':
        setStartPause(action.payload)
        break
      case 'show_prev_next_line':
        showPrevNextLineLyric(action.payload)
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

  const triggerAction = (action: StateAction) => {
    sendAction(action)
    handleAction(action)
  }

  const receiveAction = (action: StateAction) => {
    handleAction(action)
  }

  const pushSnapShot = () => {
    const currentSnapshot: StateSnapshot = {
      time: stateTime(),
      state: {
        currentSongId: $currentSongId.get(),
        currentTime: $timeServer.$currentTime.get(),
        isTimerRunning: $timeServer.$isTimerRunning.get(),
        blackScreen: $blackScreen.get(),
        autoPlay: $autoPlay.get(),
        extraView: $extraView.get(),
      }
    }
    sendAction({
      type: 'sync_state',
      payload: currentSnapshot,
    })
  }

  const pullSnapShot = (snapshot: StateSnapshot) => {
    const currentStateTime = stateTime()
    console.log(`pullSnapShot local: ${currentStateTime} remote: ${snapshot.time}`)
    if (stateTime() >= snapshot.time) {
      console.log('pullSnapShot useLocal')
      return
    }
    console.log('pullSnapShot useRemote')
    const state = snapshot.state
    $currentSongId.set(state.currentSongId)
    $blackScreen.set(state.blackScreen)
    $timeServer.restoreStste({
      currentTime: state.currentTime,
      isTimerRunning: state.isTimerRunning,
    })
    $autoPlay.set(state.autoPlay)
    $extraView.set(state.extraView)
    setStateTime(snapshot.time)
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
    if (status) {
      $extraView.set(null)
    }
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
    if (!!view) {
      $blackScreen.set(false)
    }
  }

  const showPrevNextLineLyric = (type: 'prev' | 'next') => {
    const timeline = $currentTimelineData.get() || new Map() as Map<number, TimelineData>
    const timelineTimeList = Array.from(timeline.keys())
    const currentTime = $timeServer.$currentTime.get()
    let targetTime: number | undefined = -1
    if (type === 'prev') {
      targetTime = timelineTimeList.reverse().find((time) => time < currentTime)
    } else {
      targetTime = timelineTimeList.find((time) => time > currentTime)
    }
    if (targetTime) {
      setTime(targetTime)
    } else {
      $timeServer.clear()
    }
  }

  return {
    currentLyricLine,
    triggerAction,
    receiveAction,
    pushSnapShot,
    pullSnapShot,
  } as const
}

export const $coreState = useCoreState()