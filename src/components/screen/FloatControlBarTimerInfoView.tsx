import { Show } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { Play, Pause, AlarmClockOff, AlarmClock } from 'lucide-solid'
import { $autoPlay } from '@/stores/coreState'
import { $currentSongData } from '@/stores/data'
import { parseTime } from '@/logic/time'
import { $timeServer } from '@/composables/useTimeServer'
import { $coreState } from '@/composables/useCoreState'
import ToggleButton from '@/components/common/ToggleButton'
import FavToggleButton from '@/components/common/FavToggleButton'
import { Popover } from '@ark-ui/solid'
import { Portal } from 'solid-js/web'

export default () => {
  const currentTime = useStore($timeServer.$currentTime)
  const currentSongData = useStore($currentSongData)
  const isTimerRunning = useStore($timeServer.$isTimerRunning)
  const autoPlay = useStore($autoPlay)

  const handleStartOrPauseTimer = () => {
    if (isTimerRunning()) {
      $coreState.triggerAction({ type: 'set_start_pause', payload: 'pause' })
    } else {
      $coreState.triggerAction({ type: 'set_start_pause', payload: 'start' })
    }
  }

  const isSupportAutoPlay = () => {
    const lyricLines = currentSongData()?.detail || []
    return !!lyricLines.find(line => line.time >= 0)
  }

  const handleToggleAutoPlay = () => {
    if (!isSupportAutoPlay()) return
    $coreState.triggerAction({ type: 'set_auto_play', payload: !autoPlay() })
  }

  return (
    <div class="flex items-stretch h-12 border-t border-base">
      <div class="flex-1 border-r border-base" />
      <Show when={autoPlay()}>
        <div
          class="flex items-center gap-1 px-4 border-l border-base hv-base select-none"
          onClick={handleStartOrPauseTimer}
        >
          { isTimerRunning() ? <Play size={16} /> : <Pause size={16} /> }
          <div class="text-sm font-mono">{parseTime(currentTime())}</div>
        </div>
      </Show>

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
      <FavToggleButton />
    </div>
  )
}
