import { Show, createEffect, createSignal, on } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { getDataById } from '@/stores/data'
import { $currentSongId } from '@/stores/ui'
import { $presenterConnect } from '@/stores/peer'
import { useTimeServer } from '@/composables'
import { parseLyricTimeline } from '@/logic/lyric'
import type { SongMeta, TimelineData, LyricLine, PeerAction } from '@/types'

export default () => {
  const currentSongId = useStore($currentSongId)
  const presenterConnect = useStore($presenterConnect)
  const [currentSongData, setCurrentSongData] = createSignal<SongMeta | null>(null)
  const [currentLyricTimeline, setCurrentLyricTimeline] = createSignal<Map<number, TimelineData> | null>(null)
  const [currentTime, setCurrentTime, timeController] = useTimeServer()
  const [currentLyricLineItem, setCurrentLyricLineItem] = createSignal<LyricLine | null>(null)
  const [isScreenOff, setIsScreenOff] = createSignal(true)

  createEffect(on(presenterConnect, conn => {
    if (!conn) return
    conn.on('data', rawData => {
      const data = rawData as PeerAction
      if (data.type === 'set_id') {
        $currentSongId.set(data.value)
      } else if (data.type === 'set_time') {
        setCurrentTime(data.value)
      } else if (data.type === 'set_start_pause') {
        if (data.value === 'start') {
          timeController.start()
        } else if (data.value === 'pause') {
          timeController.pause()
        }
      } else if (data.type === 'set_screen_off') {
        setIsScreenOff(data.value)
      }
    })
  }))
  createEffect(on(currentSongId, songId => {
    timeController.clear()
    setCurrentSongData(getDataById(songId))
    if (!currentSongData()) return
    const timeline = parseLyricTimeline(currentSongData()!.detail)
    setCurrentLyricTimeline(timeline)
  }))
  createEffect(on(currentTime, time => {
    if (!currentLyricTimeline()) return
    if (currentLyricTimeline()!.has(time)) {
      const line = currentLyricTimeline()!.get(time)
      console.log(line)
      setCurrentLyricLineItem(line!.data)
    }
  }, { defer: true }))

  return (
    <div class="h-full">
      <Show when={currentLyricLineItem()}>
        <p class="text-[190px] leading-tight text-center">{currentLyricLineItem()?.text}</p>
      </Show>
    </div>
  )
}