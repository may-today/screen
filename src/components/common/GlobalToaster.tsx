import { Portal } from 'solid-js/web'
import { Toast, Toaster } from '@ark-ui/solid'
import { toaster } from '@/logic/toaster'
import { X } from 'lucide-solid'


export default () => {
  return (
    <Portal>
      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root>
            <Toast.Title>{toast().title}</Toast.Title>
            <Toast.Description>{toast().description}</Toast.Description>
            <Toast.CloseTrigger class="fcc w-8 h-8 bg-transparent">
              <X size={20} />
            </Toast.CloseTrigger>
          </Toast.Root>
        )}
      </Toaster>
    </Portal>
  )
}
