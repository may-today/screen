import { Show } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { $currentSongData } from '@/stores/data'
import { $sidebarOpen } from '@/stores/ui'
import Button from '@/components/common/Button'

export default () => {
  const currentSongData = useStore($currentSongData)

  return (
    <div class="flex items-center justify-between h-12 px-4 border-t border-base">
      <h3 class="flex items-center gap-1 truncate cursor-pointer" onClick={() => $sidebarOpen.set(true)}>
        <div class="i-ph-list" />
        <Show when={currentSongData()} fallback={<div class="text-sm op-50">当前无歌曲</div>}>
          <span class="text-sm">{currentSongData()!.title}</span>
          <span class="text-xs op-50">{currentSongData()!.meta?.year}</span>
        </Show>
      </h3>
      <div>
        <div class="text-sm op-50">歌词滚动</div>
      </div>
    </div>
  )
}
