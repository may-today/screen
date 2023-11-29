import { useStore } from '@nanostores/solid'
import { Portal } from 'solid-js/web'
import { Dialog } from '@ark-ui/solid'
import { X } from 'lucide-solid'
import { $connectErrorMessage } from '@/stores/connect'

export default () => {
  const connectErrorMessage = useStore($connectErrorMessage)

  return (
    <Dialog.Root open={!!connectErrorMessage()} onOpenChange={() => $connectErrorMessage.set(null)} closeOnInteractOutside={false} trapFocus={false}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content class="relative">
            <div class="flex flex-col space-y-1.5 p-6 pb-3">
              <Dialog.Title>连接失败</Dialog.Title>
            </div>
            <div class="p-6 pt-3">
              <p class="text-sm leading-relaxed fg-lighter">{connectErrorMessage()}</p>
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