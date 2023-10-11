import { ChevronLeft, ChevronRight } from 'lucide-solid'
import { $coreState } from '@/composables'
import Button from '@/components/common/Button'
import FloatControlBarMenuButton from './FloatControlBarMenuButton'

export default () => {
  return (
    <div class="flex gap-2">
      <Button size="large" variant="outline" onClick={() => $coreState.triggerAction({ type: 'show_prev_next_line', payload: 'prev' })}>
        <ChevronLeft class="op-25" />
      </Button>
      <Button size="large" variant="outline" onClick={() => $coreState.triggerAction({ type: 'show_prev_next_line', payload: 'next' })}>
        <ChevronRight class="op-25" />
      </Button>
      <FloatControlBarMenuButton />
    </div>
  )
}