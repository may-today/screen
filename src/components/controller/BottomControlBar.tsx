import { Show } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { $currentSongData } from '@/stores/data'
import { parseTime } from '@/logic/time'
import { $mainState, $timeServer } from '@/composables'
import { ArrowDown } from 'lucide-solid'
import Button from '@/components/common/Button'
import ScreenControlView from './ScreenControlView'
import TimerInfoView from './TimerInfoView'

export default () => {
  const currentSongData = useStore($currentSongData)
  const currentTime = useStore($timeServer.$currentTime)

  return (
    <div class="flex items-stretch border-t border-base">
      <section class="flex-1">
        <div class="h-12">
          <ScreenControlView />
        </div>
        <div class="h-12 border-t border-base">
          <TimerInfoView />
        </div>
      </section>
      <section
        class="fcc w-24 border-l border-base hv-base"
        onClick={() => $mainState.handleAction({ type: 'show_next_line', payload: null })}
      >
        <ArrowDown size={40} strokeWidth={1} />
      </section>
    </div>
  )
}
