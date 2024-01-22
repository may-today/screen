import { $coreState } from '@/composables'
import { ArrowDown } from 'lucide-solid'
import ScreenControlView from './ScreenControlView'
import TimerInfoView from './TimerInfoView'

export default () => {

  return (
    <div class="flex items-stretch shrink-0 border-t border-base">
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
        onClick={() => $coreState.triggerAction({ type: 'show_prev_next_line', payload: 'next' })}
      >
        <ArrowDown size={40} strokeWidth={1} />
      </section>
    </div>
  )
}
