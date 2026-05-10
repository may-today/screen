import clsx from 'clsx'
import { Presentation, MousePointer2, Link } from 'lucide-solid'
import { Portal } from 'solid-js/web'
import { Dialog } from '@ark-ui/solid'
import { X } from 'lucide-solid'
import Button from '../common/Button'

export default () => {
  return (
    <div class="flex flex-col gap-4 p-6 rounded-xl border border-base">
      <div class="flex flex-col sm:flex-row w-full gap-4">
        <a
          href="/screen"
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
          href="/controller"
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
      <MiniAppButton />
    </div>
  )
}

const MiniAppButton = () => {
  return (
    <Dialog.Root trapFocus={false}>
      <Dialog.Trigger>
        <div
          class={clsx([
            'flex-1 flex-row gap-2 fcc rounded-md p-4 text-sm',
            'border border-base shadow-sm',
            'bg-transparent hover:bg-base-100 hover:fg-emphasis transition-colors',
            'focus-visible:outline-none focus-visible:ring-1',
          ])}
        >
          <Link size={20} strokeWidth={1.5} />
          <div>小程序版</div>
        </div>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content class="relative">
            <div class="flex flex-col space-y-1.5 p-6 pb-3">
              <Dialog.Title>MayScreen 小程序版</Dialog.Title>
            </div>
            <div class="p-6 pt-3">
              <p class="text-sm leading-relaxed fg-lighter">
                在微信中搜索「MayScreen」即可使用小程序。
              </p>
              <img src="https://wx-static.ddiu.site/mayscreen/shareimg.png" class="w-full rounded-md border border-base mt-4" />
            </div>
            <Dialog.CloseTrigger class="absolute top-2 right-2 fcc w-8 h-8 bg-transparent">
              <X size={20} />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
