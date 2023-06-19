import { useStore } from '@nanostores/solid'
import { getDataById } from '@/stores/data'
import { $currentSongId, $sidebarOpen } from '@/stores/ui'
import type { SongMeta } from '@/types'
import { For, Show } from 'solid-js'

const parseTime = (time: number) => {
  const minutes = Math.floor(time / 60)
  const seconds = time % 60
  const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`
  const secondsStr = seconds < 10 ? `0${seconds}` : `${seconds}`
  return `${minutesStr}:${secondsStr}`
}

export default () => {
  const currentSongId = useStore($currentSongId)
  const currentSongData = () => getDataById(currentSongId())

  return (
    <div class="flex flex-col h-full">
      <div class="flex-1 p-6 overflow-auto">
        <Show when={currentSongData()}>
          <For each={currentSongData()!.detail}>
            {(line) => (
              <div class="flex items-center gap-2 h-12">
                <div class="text-xs op-50 font-mono">{parseTime(line.time)}</div>
                <div class={[
                  'flex-1',
                  line.isHighlight ? 'fg-primary' : ''
                ].join(' ')}>
                  {line.text}
                </div>
              </div>
            )}
          </For>
        </Show>
      </div>
      <div class="shrink-0 flex items-center h-14 px-4 border-t border-base">
        <div class="button-icon" onClick={() => $sidebarOpen.set(!$sidebarOpen.get())}>
          <div class="i-ph:list" />
        </div>
      </div>
    </div>
  )
}