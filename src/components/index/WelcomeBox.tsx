import clsx from 'clsx'
import { Presentation, MousePointer2 } from 'lucide-solid'

export default () => {
  return (
    <div class="flex flex-col sm:flex-row w-full gap-4 p-6 rounded-xl border border-base">
      <a
        href="screen"
        class={clsx([
          'flex-1 flex-row sm:flex-col gap-2 fcc rounded-md p-4 text-sm',
          'border border-base shadow-sm',
          'bg-transparent hover:bg-base-100 hover:fg-emphasis transition-colors',
          'focus-visible:outline-none focus-visible:ring-1',
        ])}
      >
        <Presentation size={28} strokeWidth={1.5} />
        <div>屏幕</div>
      </a>
      <a
        href="controller"
        class={clsx([
          'flex-1 flex-row sm:flex-col gap-2 fcc rounded-md p-4 text-sm',
          'border border-base shadow-sm',
          'bg-transparent hover:bg-base-100 hover:fg-emphasis transition-colors',
          'focus-visible:outline-none focus-visible:ring-1',
        ])}
      >
        <MousePointer2 size={28} strokeWidth={1.5} />
        <div>遥控器</div>
      </a>
    </div>
  )
}