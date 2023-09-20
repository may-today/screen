import { Show } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { $currentSongData } from '@/stores/data'
import { $sidebarOpen } from '@/stores/ui'
import { $mainState } from '@/composables'
import { Menu, X } from 'lucide-solid'
import Button from '@/components/common/Button'

export default () => {
  const currentSongData = useStore($currentSongData)

  return (
    <div class="flex items-center justify-between h-12 px-4 border-t border-base">
      <div class="flex items-center gap-2">
        <h3 class="flex items-center gap-1 truncate cursor-pointer" onClick={() => $sidebarOpen.set(true)}>
          <Menu size={16} strokeWidth={1} class="fg-base" />
          <Show when={currentSongData()} fallback={<div class="text-sm op-50">当前无歌曲</div>}>
            <span class="text-sm">{currentSongData()!.title}</span>
          </Show>
        </h3>
        <Show when={currentSongData()}>
          <Button size="small" variant="outline" class="pr-2" onClick={() => $mainState.handleAction({ type: 'set_id', payload: null })}>
            <X size={16} strokeWidth={1} />
            <span>清除</span>
          </Button>
        </Show>
      </div>
      <div class="flex items-center">
        <div class="text-sm op-50">歌词滚动</div>
      </div>
    </div>
  )
}
