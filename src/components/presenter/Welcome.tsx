import { createSignal } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { Dialog, DialogBackdrop, DialogCloseTrigger, DialogContainer, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@ark-ui/solid'
import { Portal } from 'solid-js/web'
import clsx from 'clsx'
import { Peer } from 'peerjs'
import { $peerConnect, $roomId } from '@/stores/connect'

export default () => {
  const roomId = useStore($roomId)
  return (
    <Dialog>
      <DialogTrigger>
        <button>Open Dialog</button>
      </DialogTrigger>
      <Portal>
        <DialogBackdrop />
        <DialogContainer>
          <DialogContent>
            <div class="flex flex-col space-y-1.5 p-6">
              <DialogTitle>连接到遥控器</DialogTitle>
              <DialogDescription>正在等待新的连接...</DialogDescription>
            </div>
            <div class="p-6 pt-0">
              <p>{roomId()}</p>
            </div>
            <DialogCloseTrigger>
              <button>Close</button>
            </DialogCloseTrigger>
          </DialogContent>
        </DialogContainer>
      </Portal>
    </Dialog>
  )
}
