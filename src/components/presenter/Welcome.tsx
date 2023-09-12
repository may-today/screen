import { createSignal } from 'solid-js'
import { useStore } from '@nanostores/solid'
import {
  Dialog,
  DialogBackdrop,
  DialogCloseTrigger,
  DialogContainer,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@ark-ui/solid'
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
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>{ roomId() }</DialogDescription>
            <DialogCloseTrigger>
              <button>Close</button>
            </DialogCloseTrigger>
          </DialogContent>
        </DialogContainer>
      </Portal>
    </Dialog>
  )
}