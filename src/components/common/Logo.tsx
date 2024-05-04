import { createSignal } from 'solid-js'
import { Portal } from 'solid-js/web'
import { Dialog } from '@ark-ui/solid'
import { X } from 'lucide-solid'
import Button from './Button'

interface Props {
  showHomeButton?: boolean
}

export default (props: Props) => {
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
              <Dialog.Description>五迷创作的云端提词器</Dialog.Description>
            </div>
            <div class="p-6 pt-3">
              <p class="text-sm leading-relaxed fg-lighter">制作: <a class="fg-base" target="_blank" href="https://ddiu.io">Diu</a></p>
              <p class="text-sm leading-relaxed fg-lighter">源代码: <a class="fg-base" target="_blank" href="https://github.com/may-today/screen">may-today/screen</a></p>
            </div>
            <div class="flex justify-start px-6 pb-6">
              <Button variant="secondary" class="px-4" onClick={() => location.href = '/'}>
                返回主菜单
              </Button>
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