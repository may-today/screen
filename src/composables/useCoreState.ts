import { createSignal } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { $dataset, $currentSongId, $blackScreen, $autoPlay, $extraView, $singleTrack, $currentLyricIndex } from '@/stores/coreState'
import { $currentTimelineData, $currentSongData } from '@/stores/data'
import { sendAction } from '@/logic/connect'
import { $timeServer } from './useTimeServer'
import { singleTrackPlaceholderId } from '@/logic/singleTrack'
import type { StateAction, ExtraView, StateSnapshot, SongDetail } from '@/types'

export const useCoreState = () => {
  const [stateTime, setStateTime] = createSignal(0)
  const currentTimelineData = useStore($currentTimelineData)
  const currentLyricIndex = useStore($currentLyricIndex)
  const currentLyricLine = () => {
    const timelineData = currentTimelineData()
    const index = currentLyricIndex()
    if (!timelineData || index < 0 || index >= timelineData.length) {
      return null
    }
    return timelineData[index]
  }
  const currentLyricTimeIndexMap = () => {
    const timelineData = currentTimelineData()
    const map = new Map<number, number>()
    if (!timelineData) {
      return map
    }
    timelineData.forEach((line, index) => {
      map.set(line.startTime, index)
    })
    return map
  }

  $timeServer.$currentTime.subscribe((time) => {
    const timelineIndexMap = currentLyricTimeIndexMap()
    if (timelineIndexMap.has(time)) {
      $currentLyricIndex.set(timelineIndexMap.get(time)!)
    }
    const keys = Array.from(timelineIndexMap.keys()).sort((a, b) => a - b)
    const allSongLength = $currentSongData.get()?.meta?.length || Number(keys.pop()) + 20
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
      case 'set_dataset':
        setDataset(action.payload)
        break
      case 'set_id':
        setSongId(action.payload)
        break
      case 'set_lyric_index':
        setLyricIndex(action.payload)
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
      case 'set_single_track':
        setSingleTrack(action.payload)
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
        dataset: $dataset.get(),
        currentSongId: $currentSongId.get(),
        currentTime: $timeServer.$currentTime.get(),
        currentLyricIndex: $currentLyricIndex.get(),
        isTimerRunning: $timeServer.$isTimerRunning.get(),
        blackScreen: $blackScreen.get(),
        autoPlay: $autoPlay.get(),
        extraView: $extraView.get(),
        singleTrack: $singleTrack.get(),
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
    $dataset.set(state.dataset)
    $singleTrack.set(state.singleTrack)
    $currentSongId.set(state.currentSongId)
    $blackScreen.set(state.blackScreen)
    $timeServer.restoreState({
      currentTime: state.currentTime,
      isTimerRunning: state.isTimerRunning,
    })
    $currentLyricIndex.set(state.currentLyricIndex)
    $autoPlay.set(state.autoPlay)
    $extraView.set(state.extraView)
    setStateTime(snapshot.time)
  }

  const setDataset = (dataset: string) => {
    if (dataset === $dataset.get()) {
      return
    }
    $dataset.set(dataset)
    setSongId(null)
  }

  const setSongId = (id: string | null) => {
    $timeServer.clear()
    $currentLyricIndex.set(-1)
    $autoPlay.set(false)
    $currentSongId.set(id)
    if (id !== singleTrackPlaceholderId) {
      setSingleTrack(null)
    }
  }

  const setLyricIndex = (index: number) => {
    if (!$currentSongId.get()) {
      return
    }
    if (index < 0) {
      $timeServer.clear()
      $currentLyricIndex.set(index)
      return
    }
    $currentLyricIndex.set(index)
    const timeline = $currentTimelineData.get()
    const targetStartTime = timeline[index].startTime
    if (targetStartTime >= 0) {
      $timeServer.$currentTime.set(targetStartTime)
      if ($autoPlay.get()) {
        $timeServer.pause()
        $timeServer.start()
      }
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

  const setSingleTrack = (track: SongDetail | null) => {
    $singleTrack.set(track)
    if (track) {
      setSongId(singleTrackPlaceholderId)
    }
  }

  const showPrevNextLineLyric = (type: 'prev' | 'next') => {
    const timeline = $currentTimelineData.get()
    const currentLyricIndex = $currentLyricIndex.get()
    let targetLyricIndex = type === 'prev' ? currentLyricIndex - 1 : currentLyricIndex + 1
    if (targetLyricIndex < -1 || targetLyricIndex >= timeline.length) {
      targetLyricIndex = -1
    }
    setLyricIndex(targetLyricIndex)
  }

  return {
    currentLyricIndex,
    currentLyricLine,
    triggerAction,
    receiveAction,
    pushSnapShot,
    pullSnapShot,
  } as const
}

export const $coreState = useCoreState()