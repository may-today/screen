import { useStore } from '@nanostores/solid'
import { $currentSongData } from '@/stores/data'
import { Show } from 'solid-js'

export default () => {
  const currentSongData = useStore($currentSongData)

  return (
    <div class="flex items-center justify-between h-12 px-4 border-t border-base">
      <h3 class="flex items-center gap-1 truncate">
        <Show when={currentSongData()} fallback={<div class="text-sm op-50">当前无歌曲</div>}>
          <span class="text-sm">{currentSongData()!.title}</span>
          <span class="text-xs op-50">{currentSongData()!.meta?.year}</span>
        </Show>
      </h3>
    </div>
  )
}
