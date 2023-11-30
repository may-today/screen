import { createSignal } from 'solid-js'
import { Portal } from 'solid-js/web'
import { Dialog } from '@ark-ui/solid'
import { X } from 'lucide-solid'

export default () => {
  const [showDialog, setShowDialog] = createSignal(false)

  return (
    <Dialog open={showDialog()} trapFocus={false}>
      <Dialog.Trigger>
        <span class="text-sm p-1">May<span class="fg-primary">Screen</span></span>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content class="relative">
            <div class="flex flex-col space-y-1.5 p-6 pb-3">
              <Dialog.Title>MayScreen</Dialog.Title>
              <Dialog.Description>五月天云端提词器</Dialog.Description>
            </div>
            <div class="p-6 pt-3">
              <p class="text-sm leading-relaxed fg-lighter">本工具为非官方软件，与相信音乐并无关联。</p>
              <p class="text-sm leading-relaxed fg-lighter">歌词由 <a class="fg-base" target="_blank" href="https://ddiu.io">Diu</a> 于 <a class="fg-base" target="_blank" href="https://mayday.blue">mayday.blue</a> 整理</p>
              <p class="text-sm leading-relaxed fg-lighter">源代码: <a class="fg-base" target="_blank" href="https://github.com/may-today/screen">may-today/screen</a></p>
            </div>
            <Dialog.CloseTrigger class="absolute top-2 right-2 fcc w-8 h-8 bg-transparent">
              <X size={20} />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog>
  )
}