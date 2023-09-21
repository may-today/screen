import { Show } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { $autoPlay } from '@/stores/mainState'
import { $currentSongData } from '@/stores/data'
import { $sidebarOpen } from '@/stores/ui'
import { $mainState } from '@/composables'
import { Menu, X, AlarmClockOff, AlarmClock } from 'lucide-solid'
import Button from '@/components/common/Button'
import ToggleButton from '@/components/common/ToggleButton'

export default () => {
  const currentSongData = useStore($currentSongData)
  const autoPlay = useStore($autoPlay)

  const handleToggleAutoPlay = () => {
    $mainState.handleAction({ type: 'set_auto_play', payload: !autoPlay() })
  }

  return (
    <div class="flex items-stretch justify-between h-12 border-t border-base overflow-hidden">
      <div class="flex-1 flex items-center gap-2 px-4 border-r border-base">
        <h3 class="flex-1 flex items-center gap-1 truncate cursor-pointer" onClick={() => $sidebarOpen.set(true)}>
          <Menu size={16} strokeWidth={1} class="fg-base shrink-0" />
          <Show when={currentSongData()} fallback={<div class="text-sm op-50">当前无歌曲</div>}>
            <span class="text-sm truncate shrink-1">{currentSongData()!.title}</span>
          </Show>
        </h3>
        <Show when={currentSongData()}>
          <Button size="small" variant="outline" class="pr-2" onClick={() => $mainState.handleAction({ type: 'set_id', payload: null })}>
            <X size={16} strokeWidth={1} />
            <span>清除</span>
          </Button>
        </Show>
      </div>
      <ToggleButton toggle={autoPlay()} onClick={handleToggleAutoPlay}>
        { autoPlay() ? <AlarmClock size={16} /> : <AlarmClockOff size={16} /> }
        <span>自动播放</span>
      </ToggleButton>
    </div>
  )
}
