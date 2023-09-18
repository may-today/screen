import { Show, createEffect, createSignal, on } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { $currentSongData, fetchAndUpdateData } from '@/stores/data'
import { $currentSongId } from '@/stores/ui'
import { $peerConnect } from '@/stores/connect'
import { useTimeServer } from '@/composables'
import { parseLyricTimeline } from '@/logic/lyric'
import img1 from '@/assets/1.png'
import img2 from '@/assets/2.png'
import type { SongDetail, TimelineData, LyricLine, PeerAction } from '@/types'

export default () => {
  const currentSongId = useStore($currentSongId)
  const peerConnect = useStore($peerConnect)
  const currentSongData = useStore($currentSongData)
  const [currentLyricTimeline, setCurrentLyricTimeline] = createSignal<Map<number, TimelineData> | null>(null)
  const [currentTime, setCurrentTime, timeController] = useTimeServer()
  const [currentLyricLineItem, setCurrentLyricLineItem] = createSignal<LyricLine | null>(null)
  const [isScreenOff, setIsScreenOff] = createSignal(false)
  const [currentText, setCurrentText] = createSignal('')
  const [currentImage, setCurrentImage] = createSignal(0)

  createEffect(on(peerConnect, conn => {
    if (!conn) return
    conn.on('data', rawData => {
      const data = rawData as PeerAction
      console.log('receive data', data)
      if (data.type === 'set_id') {
        $currentSongId.set(data.value)
      } else if (data.type === 'set_time') {
        timeController.pause()
        setCurrentTime(data.value)
        timeController.start()
        setIsScreenOff(false)
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
      } else if (data.type === 'update_data') {
        fetchAndUpdateData()
      }
    })
  }))
  createEffect(on(currentSongData, songData => {
    if (!songData) return
    timeController.clear()
    setCurrentLyricTimeline(null)
    setCurrentLyricLineItem(null)
    setCurrentLyricTimeline(null)
    timeController.clear()
    console.log('currentLyricLineItem', currentLyricLineItem())
    if (!currentSongData()) {
      return
    }
    const timeline = parseLyricTimeline(currentSongData()!.detail)
    setCurrentLyricTimeline(timeline)
  }))
  createEffect(on(currentTime, time => {
    if (!currentLyricTimeline()) return
    if (currentLyricTimeline()!.has(time) && time !== 0) {
      const line = currentLyricTimeline()!.get(time)
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
          {currentImage() === 1 && <img src={img1} />}
          {currentImage() === 2 && <img src={img2} />}
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