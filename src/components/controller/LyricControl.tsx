import { For, Show, createEffect, createSignal, on } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { getDataById } from '@/stores/data'
import { $currentSongId, $sidebarOpen } from '@/stores/ui'
import { useTimeServer } from '@/composables'
import { parseLyricTimeline } from '@/logic/lyric'
import Button from '../ui/Button'
import type { SongMeta, TimelineData } from '@/types'

const parseTime = (time: number) => {
  const minutes = Math.floor(time / 60)
  const seconds = time % 60
  const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`
  const secondsStr = seconds < 10 ? `0${seconds}` : `${seconds}`
  return `${minutesStr}:${secondsStr}`
}

export default () => {
  const currentSongId = useStore($currentSongId)
  const [currentSongData, setCurrentSongData] = createSignal<SongMeta | null>(null)
  const [currentLyricTimeline, setCurrentLyricTimeline] = createSignal<Map<number, TimelineData> | null>(null)
  const [currentTime, setCurrentTime, timeController] = useTimeServer()
  const [currentLyricStartTime, setCurrentLyricStartTime] = createSignal(-1)
  const [isScreenOn, setIsScreenOn] = createSignal(true)

  const handleSetTime = (time: number) => {
    timeController.pause()
    setCurrentTime(time)
    timeController.start()
  }

  createEffect(on(currentSongId, songId => {
    timeController.clear()
    setCurrentSongData(getDataById(songId))
    if (!currentSongData()) return
    setCurrentLyricTimeline(parseLyricTimeline(currentSongData()!.detail))
  }))
  createEffect(on(currentTime, time => {
    if (!currentLyricTimeline()) return
    if (currentLyricTimeline()!.has(time)) {
      const line = currentLyricTimeline()!.get(time)
      console.log(line)
      setCurrentLyricStartTime(line!.startTime)
    }
  }, { defer: true }))

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
          <Button icon={timeController.isRunning() ? 'i-ph:pause' : 'i-ph:play'} onClick={() => timeController.startOrPause()} />
          <Button
            class={isScreenOn() ? '' : 'bg-red/40 hover:bg-red/50 text-red-800 dark:text-red-400'}
            icon={isScreenOn() ? 'i-ph:eye' : 'i-ph:eye-closed'}
            onClick={() => setIsScreenOn(!isScreenOn())}
          />
        </div>
      </div>
    </div>
  )
}