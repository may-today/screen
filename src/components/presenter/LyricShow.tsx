import { Show, createEffect, createSignal, on } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { getDataById } from '@/stores/data'
import { $currentSongId } from '@/stores/ui'
import { $presenterConnect } from '@/stores/peer'
import { useTimeServer } from '@/composables'
import { parseLyricTimeline } from '@/logic/lyric'
import img1 from '@/assets/1.png'
import type { SongMeta, TimelineData, LyricLine, PeerAction } from '@/types'

export default () => {
  const currentSongId = useStore($currentSongId)
  const presenterConnect = useStore($presenterConnect)
  const [currentSongData, setCurrentSongData] = createSignal<SongMeta | null>(null)
  const [currentLyricTimeline, setCurrentLyricTimeline] = createSignal<Map<number, TimelineData> | null>(null)
  const [currentTime, setCurrentTime, timeController] = useTimeServer()
  const [currentLyricLineItem, setCurrentLyricLineItem] = createSignal<LyricLine | null>(null)
  const [isScreenOff, setIsScreenOff] = createSignal(false)
  const [currentText, setCurrentText] = createSignal('')
  const [currentImage, setCurrentImage] = createSignal(0)

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
      } else if (data.type === 'set_text') {
        setCurrentText(data.value)
      } else if (data.type === 'set_image') {
        setCurrentImage(data.value)
      }
    })
  }))
  createEffect(on(currentSongId, songId => {
    timeController.clear()
    setCurrentSongData(getDataById(songId))
    if (!currentSongData()) {
      setCurrentLyricTimeline(null)
      setCurrentLyricLineItem(null)
      setCurrentLyricTimeline(null)
      timeController.clear()
      return
    }
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
      <div class={[
        'absolute inset-0 bg-black z-5 transition-opacity duration-600',
        'text-[190px] leading-tight text-center font-bold',
        (isScreenOff() || currentText() || currentImage()) ? 'op-100' : 'op-0',
      ].join(' ')}>
        <Show when={currentText()}>
          {currentText()}
        </Show>
        <Show when={!currentText() && currentImage()}>
          <img src={img1} />
        </Show>
      </div>
      <Show when={currentSongData() && !currentLyricLineItem()}>
        <Show when={currentSongData()!.meta?.year}>
          <p class="text-[120px] leading-tight mx-4">{currentSongData()!.meta.year}</p>
        </Show>
        <p class="text-[220px] leading-tight font-bold">{currentSongData()!.title}</p>
      </Show>
      <Show when={currentLyricLineItem()}>
        <p class="text-[190px] leading-tight text-center font-bold">{currentLyricLineItem()?.text}</p>
      </Show>
    </div>
  )
}