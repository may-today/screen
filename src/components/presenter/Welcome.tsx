import { createSignal } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { Dialog, DialogBackdrop, DialogContainer, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@ark-ui/solid'
import { Portal } from 'solid-js/web'
import clsx from 'clsx'
import { Peer } from 'peerjs'
import { $peerConnect, $roomId } from '@/stores/connect'

export default () => {
  const [showDialog, setShowDialog] = createSignal(false)
  const roomId = useStore($roomId)
  return (
    <Dialog
      open={showDialog()}
      onClose={() => setShowDialog(false)}
      closeOnEsc={false}
      closeOnOutsideClick={false}
    >
      <DialogTrigger>
        <button>Open Dialog</button>
      </DialogTrigger>
      <Portal>
        <DialogBackdrop />
        <DialogContainer>
          <DialogContent>
            <div class="flex flex-col space-y-1.5 p-6">
              <DialogTitle>连接到遥控器</DialogTitle>
              <DialogDescription>请在遥控端输入 ID 进行连接</DialogDescription>
            </div>
            <div class="fcc p-6 pt-0">
              <p class="text-4xl font-semibold">{roomId()}</p>
            </div>
          </DialogContent>
        </DialogContainer>
      </Portal>
    </Dialog>
  )
}
