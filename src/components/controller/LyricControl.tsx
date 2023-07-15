import { For, Show, createEffect, createSignal, on } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { getDataById } from '@/stores/data'
import { $currentSongId, $sidebarOpen } from '@/stores/ui'
import { sendDataToPresenter } from '@/stores/peer'
import { useTimeServer } from '@/composables'
import { parseLyricTimeline } from '@/logic/lyric'
import { parseTime } from '@/logic/time'
import Button from '../ui/Button'
import type { SongDetail, TimelineData } from '@/types'

export default () => {
  const currentSongId = useStore($currentSongId)
  const [currentSongData, setCurrentSongData] = createSignal<SongDetail | null>(null)
  const [currentLyricTimeline, setCurrentLyricTimeline] = createSignal<Map<number, TimelineData> | null>(null)
  const [currentTime, setCurrentTime, timeController] = useTimeServer()
  const [currentLyricStartTime, setCurrentLyricStartTime] = createSignal(-1)
  const [isScreenOff, setIsScreenOff] = createSignal(false)
  const [currentText, setCurrentText] = createSignal('')
  const [currentImage, setCurrentImage] = createSignal(0)

  createEffect(on(currentSongId, songId => {
    sendDataToPresenter({ type: 'set_id', value: songId })
    timeController.clear()
    const data = getDataById(songId)
    setCurrentSongData(data)
    setCurrentLyricTimeline(null)
    setCurrentLyricStartTime(-1)
    if (!data) {
      return
    }
    const timeline = parseLyricTimeline(currentSongData()!.detail)
    setCurrentLyricTimeline(timeline)
    console.log(data)
    console.log(timeline)
  }))
  createEffect(on(currentTime, time => {
    if (!currentLyricTimeline()) return
    if (currentLyricTimeline()!.has(time)) {
      const line = currentLyricTimeline()!.get(time)
      console.log(line)
      setCurrentLyricStartTime(line!.startTime)
    }
  }, { defer: true }))

  const handleSetTime = (time: number) => {
    sendDataToPresenter({ type: 'set_time', value: time })
    timeController.pause()
    setCurrentTime(time)
    timeController.start()
    setIsScreenOff(false)
  }
  const handleSetScreenOff = () => {
    setIsScreenOff(!isScreenOff())
    sendDataToPresenter({ type: 'set_screen_off', value: isScreenOff() })
  }
  const handleStartPause = () => {
    if (!currentLyricTimeline()) return
    if (timeController.isRunning()) {
      sendDataToPresenter({ type: 'set_start_pause', value: 'pause' })
      timeController.pause()
    } else {
      sendDataToPresenter({ type: 'set_start_pause', value: 'start' })
      timeController.start()
    }
  }
  const handleSetImage = () => {
    const text = prompt('Send image', currentImage().toString() || '') || ''
    const selectImage = parseInt(text) || 0
    setCurrentImage(selectImage)
    sendDataToPresenter({ type: 'set_image', value: selectImage })
  }
  const handleSetText = () => {
    const text = prompt('Send text', currentText() || '') || ''
    setCurrentText(text)
    sendDataToPresenter({ type: 'set_text', value: text })
  }
  const handleClearSong = () => {
    $currentSongId.set(null)
  }

  return (
    <div class="flex flex-col h-full">
      <div class="flex-1 overflow-auto">
        <Show when={currentLyricTimeline()}>
          <For each={Array.from(currentLyricTimeline()!.values())}>
            {(line) => (
              <div
                class="relative flex items-start gap-2 px-6 py-2 border-b border-base hv-base"
                onClick={() => { handleSetTime(line.startTime) }}
              >
                <div
                  class={[
                    'absolute inset-0',
                    currentLyricStartTime() === line.startTime && timeController.isRunning() ? 'anim-bar' : ''
                  ].join(' ')}
                  style={{ 'animation-duration': `${line.duration}s` }}
                />
                <div class={[
                  'text-xs font-mono mt-1',
                  currentLyricStartTime() === line.startTime ? 'font-bold fg-primary op-70' : 'op-30',
                ].join(' ')}>
                  {parseTime(line.startTime)}
                </div>
                <div class={[
                  'flex-1',
                  line.data.isHighlight ? 'fg-primary' : '',
                  currentLyricStartTime() === line.startTime ? 'font-bold' : ''
                ].join(' ')}>
                  {line.data.text}
                </div>
              </div>
            )}
          </For>
        </Show>
      </div>
      <div class="shrink-0 flex items-center justify-between gap-2 h-14 px-4 border-t border-base">
        <div class="flex-1 flex items-center gap-2 overflow-hidden">
          <Button icon="i-ph-list" onClick={() => $sidebarOpen.set(true)} />
          <Button icon="i-ph-x" onClick={handleClearSong} />
          <div class="text-xs op-50 truncate">{currentSongData()?.title}</div>
        </div>
        <div class="shrink-0 flex items-center gap-2">
          <div class="text-xs op-50 font-mono">{parseTime(currentTime())}</div>
          <Button icon={timeController.isRunning() ? 'i-ph:pause' : 'i-ph:play'} onClick={handleStartPause} />
          <Button
            class={isScreenOff() ? 'bg-red/40 hover:bg-red/50 text-red-800 dark:text-red-400' : ''}
            icon={isScreenOff() ? 'i-ph:eye-closed' : 'i-ph:eye'}
            onClick={handleSetScreenOff}
          />
          <Button
            class={currentImage() ? 'bg-sky/40 hover:bg-sky/50 text-sky-800 dark:text-sky-400' : ''}
            icon="i-ph:image"
            onClick={handleSetImage}
          />
          <Button
            class={currentText() ? 'bg-sky/40 hover:bg-sky/50 text-sky-800 dark:text-sky-400' : ''}
            icon="i-ph:text-t"
            onClick={handleSetText}
          />
        </div>
      </div>
    </div>
  )
}