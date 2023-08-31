import { createSignal } from 'solid-js'
import {
  Segment,
  SegmentControl,
  SegmentGroup,
  SegmentIndicator,
  SegmentLabel,
} from '@ark-ui/solid'
import clsx from 'clsx'
import { Presentation, MousePointer2 } from 'lucide-solid'

export default () => {
  const [value, setValue] = createSignal('presenter')
  return (
    <div class="flex w-full gap-4 bg-base p-6 rounded-xl border border-base shadow">
      <button
        class={clsx([
          'flex-1 flex-col gap-2 fcc rounded-md p-4 font-medium',
          'border-2 border-base shadow-sm',
          'bg-transparent hover:bg-base-100 hover:fg-emphasis transition-colors',
          'focus-visible:outline-none focus-visible:ring-1',
        ])}
      >
        <Presentation size={28} />
        <div>屏幕</div>
      </button>
      <button
        class={clsx([
          'flex-1 flex-col gap-2 fcc rounded-md p-4 font-medium',
          'border-2 border-base shadow-sm',
          'bg-transparent hover:bg-base-100 hover:fg-emphasis transition-colors',
          'focus-visible:outline-none focus-visible:ring-1',
        ])}
      >
        <MousePointer2 size={28} />
        <div>控制器</div>
      </button>
    </div>
  )
}