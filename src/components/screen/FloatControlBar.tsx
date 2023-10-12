import { Show } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { X, ChevronLeft, ChevronRight } from 'lucide-solid'
import { $extraView } from '@/stores/coreState'
import { $currentSongData } from '@/stores/data'
import { $coreState } from '@/composables'
import Button from '@/components/common/Button'
import FloatControlBarMenuButton from './FloatControlBarMenuButton'

export default () => {
  const extraView = useStore($extraView)
  const currentSongData = useStore($currentSongData)

  return (
    <div class="flex gap-2">
      <Show when={extraView()}>
        <Button size="large" variant="outline" onClick={() => $coreState.triggerAction({ type: 'set_extra', payload: null })}>
          <X class="op-25" />
        </Button>
      </Show>
      <Show when={currentSongData()}>
        <Button size="large" variant="outline" onClick={() => $coreState.triggerAction({ type: 'show_prev_next_line', payload: 'prev' })}>
          <ChevronLeft class="op-25" />
        </Button>
        <Button size="large" variant="outline" onClick={() => $coreState.triggerAction({ type: 'show_prev_next_line', payload: 'next' })}>
          <ChevronRight class="op-25" />
        </Button>
      </Show>
      <FloatControlBarMenuButton />
    </div>
  )
}