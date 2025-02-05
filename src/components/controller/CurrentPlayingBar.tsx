import { Show } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { $autoPlay } from '@/stores/coreState'
import { $currentSongData } from '@/stores/data'
import { $sidebarOpen } from '@/stores/ui'
import { $coreState } from '@/composables'
import { Menu, X, AlarmClockOff, AlarmClock } from 'lucide-solid'
import Button from '@/components/common/Button'
import ToggleButton from '@/components/common/ToggleButton'
import { Popover } from '@ark-ui/solid'
import { Portal } from 'solid-js/web'

export default () => {
  const currentSongData = useStore($currentSongData)
  const autoPlay = useStore($autoPlay)

  const isSupportAutoPlay = () => {
    const lyricLines = currentSongData()?.detail || []
    return !!lyricLines.find(line => line.time >= 0)
  }

  const handleToggleAutoPlay = () => {
    if (!isSupportAutoPlay()) return
    $coreState.triggerAction({ type: 'set_auto_play', payload: !autoPlay() })
  }

  return (
    <div class="flex items-stretch justify-between shrink-0 h-14 border-t border-base overflow-hidden">
      <div class="flex-1 flex items-center gap-1 px-4 border-r border-base">
        <h3 class="flex items-center gap-1 cursor-pointer h-full p-2 -ml-2" onClick={() => $sidebarOpen.set(true)}>
          <Menu size={16} strokeWidth={1} class="fg-base shrink-0" />
          <Show when={currentSongData()} fallback={<div class="text-sm op-50">当前无歌曲</div>}>
            <span class="text-sm line-clamp-2">{currentSongData()!.title}{currentSongData()!.meta?.artist ? ` - ${currentSongData()!.meta.artist}` : ''}</span>
          </Show>
        </h3>
        <Show when={currentSongData()}>
          <Button size="small" variant="outline" class="pr-2" onClick={() => $coreState.triggerAction({ type: 'set_id', payload: null })}>
            <X size={16} strokeWidth={1} />
            <span>清除</span>
          </Button>
        </Show>
      </div>

      <Show when={currentSongData() && !isSupportAutoPlay()} fallback={
        <ToggleButton toggle={autoPlay()} disabled={!isSupportAutoPlay()} onClick={handleToggleAutoPlay}>
          { autoPlay() ? <AlarmClock size={16} /> : <AlarmClockOff size={16} /> }
          <span>自动播放</span>
        </ToggleButton>
      }>
        <Popover.Root closeOnInteractOutside={false} positioning={{ placement: 'top' }}>
          <Popover.Trigger>
            <ToggleButton toggle={autoPlay()} disabled={!isSupportAutoPlay()} onClick={handleToggleAutoPlay}>
              { autoPlay() ? <AlarmClock size={16} /> : <AlarmClockOff size={16} /> }
              <span>自动播放</span>
            </ToggleButton>
          </Popover.Trigger>
          <Portal>
            <Popover.Positioner>
              <Popover.Content>
                <span class="text-sm op-50 py-1 px-2">当前歌曲不支持自动播放</span>
              </Popover.Content>
            </Popover.Positioner>
          </Portal>
        </Popover.Root>
      </Show>
    </div>
  )
}
