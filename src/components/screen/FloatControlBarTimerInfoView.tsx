import { Show } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { Play, Asterisk, AlarmClockOff, AlarmClock } from 'lucide-solid'
import { $autoPlay } from '@/stores/coreState'
import { $currentSongData } from '@/stores/data'
import { parseTime } from '@/logic/time'
import { $timeServer } from '@/composables/useTimeServer'
import { $coreState } from '@/composables/useCoreState'
import ToggleButton from '@/components/common/ToggleButton'

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
          { isTimerRunning() ? <Play size={16} /> : <Asterisk size={16} /> }
          <div class="text-sm font-mono">{parseTime(Math.floor(currentTime() / 10))}</div>
        </div>
      </Show>
      <ToggleButton toggle={autoPlay()} disabled={!isSupportAutoPlay()} onClick={handleToggleAutoPlay}>
        { autoPlay() ? <AlarmClock size={16} /> : <AlarmClockOff size={16} /> }
        <span>自动播放</span>
      </ToggleButton>
    </div>
  )
}
