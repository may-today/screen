import { useStore } from '@nanostores/solid'
import { Portal } from 'solid-js/web'
import { Dialog, DialogBackdrop, DialogCloseTrigger, DialogContainer, DialogContent, DialogDescription, DialogTitle } from '@ark-ui/solid'
import { X } from 'lucide-solid'
import { $connectErrorMessage } from '@/stores/connect'

export default () => {
  const connectErrorMessage = useStore($connectErrorMessage)

  return (
    <Dialog open={!!connectErrorMessage()} onClose={() => $connectErrorMessage.set(null)} closeOnOutsideClick={false} trapFocus={false}>
      <Portal>
        <DialogBackdrop />
        <DialogContainer>
          <DialogContent class="relative">
            <div class="flex flex-col space-y-1.5 p-6 pb-3">
              <DialogTitle>连接失败</DialogTitle>
            </div>
            <div class="p-6 pt-3">
              <p class="text-sm leading-relaxed fg-lighter">{connectErrorMessage()}</p>
            </div>
            <DialogCloseTrigger class="absolute top-2 right-2 fcc w-8 h-8 bg-transparent">
              <X size={20} />
            </DialogCloseTrigger>
          </DialogContent>
        </DialogContainer>
      </Portal>
    </Dialog>
  )
}