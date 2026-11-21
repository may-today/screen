import { createSignal } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { $dataset, $currentSongId, $blackScreen, $autoPlay, $extraView, $singleTrack, $currentLyricIndex } from '@/stores/coreState'
import { $currentTimelineData, $currentSongData } from '@/stores/data'
import { sendAction } from '@/logic/connect'
import { $timeServer } from './useTimeServer'
import { singleTrackPlaceholderId } from '@/logic/singleTrack'
import type { StateAction, ExtraView, StateSnapshot, SongDetail, FavListExportData } from '@/types'
import { importFavListExportData } from '@/stores/favList'

export const useCoreState = () => {
  const source = Math.random().toString(36).slice(2)
  let stateTime = 0
  let stateSource = ''
  const version = () => stateTime + '/' + stateSource
  const isNewer = (time: number, author: string) =>
    time > stateTime || (time === stateTime && author > stateSource)

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
  const nextLyricLine = () => {
    const timelineData = currentTimelineData()
    const index = currentLyricIndex()
    if (!timelineData || index < 0 || index >= timelineData.length - 1) {
      return null
    }
    return timelineData[index + 1] || null
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
      case 'set_fav_data':
        setFavData(action.payload)
        break
    }
  }

  const triggerAction = (action: StateAction) => {
    if (action.type === 'set_fav_data') {
      sendAction(action)
      handleAction(action)
      return
    }
    const parent = version()
    stateTime = Math.max(Date.now(), stateTime + 1)
    stateSource = source
    handleAction(action)
    // The playback timers can tick between the click and its delivery.
    const update: StateAction = action.type === 'show_prev_next_line'
      ? { type: 'set_lyric_index', payload: $currentLyricIndex.get() }
      : action
    sendAction({ ...update, revision: { time: stateTime, source, parent } })
  }

  const receiveAction = (action: StateAction) => {
    if (action.type === 'request_snapshot') {
      if (action.payload === source) pushSnapShot()
      return
    }
    if (action.type === 'sync_state' || action.type === 'set_fav_data') {
      handleAction(action)
      return
    }
    const revision = action.revision
    if (revision) {
      if (!isNewer(revision.time, revision.source)) return
      // A relative command is only valid against the state its author saw.
      if (revision.parent !== version()) {
        sendAction({ type: 'request_snapshot', payload: revision.source })
        return
      }
      stateTime = revision.time
      stateSource = revision.source
    } else {
      stateTime = Math.max(Date.now(), stateTime + 1)
      stateSource = ''
    }
    handleAction(action)
  }

  const pushSnapShot = () => {
    const currentSnapshot: StateSnapshot = {
      time: stateTime,
      source: stateSource,
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
    if (!isNewer(snapshot.time, snapshot.source ?? '')) return
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
    stateTime = snapshot.time
    stateSource = snapshot.source ?? ''
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
    const targetStartTime = timeline[index]?.startTime
    if (targetStartTime != null && targetStartTime >= 0) {
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

  const setFavData = (data: FavListExportData) => {
    importFavListExportData(data)
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
    nextLyricLine,
    triggerAction,
    receiveAction,
    pushSnapShot,
    pullSnapShot,
  } as const
}

export const $coreState = useCoreState()