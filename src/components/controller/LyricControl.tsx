import { For, Show, createEffect, createSignal, on } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { getDataById } from '@/stores/data'
import { $currentSongId, $sidebarOpen } from '@/stores/ui'
import { sendDataToPresenter } from '@/stores/peer'
import { useTimeServer } from '@/composables'
import { parseLyricTimeline } from '@/logic/lyric'
import { parseTime } from '@/logic/time'
import Button from '../ui/Button'
import type { SongMeta, TimelineData } from '@/types'

export default () => {
  const currentSongId = useStore($currentSongId)
  const [currentSongData, setCurrentSongData] = createSignal<SongMeta | null>(null)
  const [currentLyricTimeline, setCurrentLyricTimeline] = createSignal<Map<number, TimelineData> | null>(null)
  const [currentTime, setCurrentTime, timeController] = useTimeServer()
  const [currentLyricStartTime, setCurrentLyricStartTime] = createSignal(-1)
  const [isScreenOff, setIsScreenOff] = createSignal(false)

  createEffect(on(currentSongId, songId => {
    if (!songId) return
    timeController.clear()
    setCurrentSongData(getDataById(songId))
    if (!currentSongData()) return
    sendDataToPresenter({ type: 'set_id', value: songId })
    const timeline = parseLyricTimeline(currentSongData()!.detail)
    setCurrentLyricTimeline(timeline)
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
    timeController.pause()
    sendDataToPresenter({ type: 'set_start_pause', value: 'pause' })
    setCurrentTime(time)
    sendDataToPresenter({ type: 'set_time', value: time })
    timeController.start()
    sendDataToPresenter({ type: 'set_start_pause', value: 'start' })
  }
  const handleSetScreenOff = () => {
    setIsScreenOff(!isScreenOff())
    sendDataToPresenter({ type: 'set_screen_off', value: !isScreenOff() })
  }
  const handleStartPause = () => {
    if (timeController.isRunning()) {
      timeController.pause()
      sendDataToPresenter({ type: 'set_start_pause', value: 'pause' })
    } else {
      timeController.start()
      sendDataToPresenter({ type: 'set_start_pause', value: 'start' })
    }
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
        <Button icon="i-ph-list" onClick={() => $sidebarOpen.set(!$sidebarOpen.get())} />
        <div class="flex items-center gap-2">
          <div class="text-xs op-50 font-mono">{parseTime(currentTime())}</div>
          <Button icon={timeController.isRunning() ? 'i-ph:pause' : 'i-ph:play'} onClick={handleStartPause} />
          <Button
            class={isScreenOff() ? 'bg-red/40 hover:bg-red/50 text-red-800 dark:text-red-400' : ''}
            icon={isScreenOff() ? 'i-ph:eye-closed' : 'i-ph:eye'}
            onClick={handleSetScreenOff}
          />
        </div>
      </div>
    </div>
  )
}