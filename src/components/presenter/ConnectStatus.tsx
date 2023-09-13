import { createSignal } from 'solid-js'
import { Portal } from 'solid-js/web'
import { useStore } from '@nanostores/solid'
import { Peer } from 'peerjs'
import clsx from 'clsx'
import { Dialog, DialogBackdrop, DialogCloseTrigger, DialogContainer, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@ark-ui/solid'
import { $peerConnect, $roomId } from '@/stores/connect'
import type { ConnectState } from '@/types'

export default () => {
  const [connectStatus, setConnectStatus] = createSignal<ConnectState>('none')
  const [showDialog, setShowDialog] = createSignal(true)
  const roomId = useStore($roomId)
  const serverOptions = {
    host: 'peer.ddiu.io',
    port: window.location.protocol === 'https:' ? 443 : 80,
  }
  const sessionRoomId = sessionStorage.getItem('roomId')
  const peer = new Peer(sessionRoomId, serverOptions)

  peer.on('open', (id) => {
    console.log('peer open', id)
    $roomId.set(id)
    sessionStorage.setItem('roomId', id)
  })

  peer.on('connection', (conn) => {
    console.log('conn connection', conn)
    $peerConnect.set(conn)
    conn.on('open', () => {
      console.log('conn open')
      setConnectStatus('connected')
    })
    conn.on('close', () => {
      console.log('conn close')
      setConnectStatus('none')
    })
    conn.on('error', (err) => {
      console.log('conn error', err)
      setConnectStatus('error')
    })
  })
  peer.on('disconnected', (err) => {
    setConnectStatus('none')
    console.log('peer disconnected', err)
  })
  peer.on('error', (err) => {
    setConnectStatus('error')
    console.log('peer error', err)
  })

  const dotClass = () =>
    ({
      none: 'bg-gray',
      connected: 'bg-green-700',
      error: 'bg-red',
    }[connectStatus()])

  return (
    <>
      <button
        class={clsx([
          'absolute flex items-center justify-center gap-1 bottom-1 left-1',
          'bg-transparent p-2 z-10'
        ])}
        onClick={() => setShowDialog(true)}
      >
        <div class={`h-1 w-1 rounded-full z-10 ${dotClass()}`} />
        {/* <div class="text-xs">未连接</div> */}
      </button>
      <Dialog open={showDialog()} onClose={() => setShowDialog(false)}>
        <Portal>
          <DialogBackdrop />
          <DialogContainer>
            <DialogContent>
              <div class="flex flex-col space-y-1.5 p-6">
                <DialogTitle>连接到遥控器</DialogTitle>
                <DialogDescription>请在遥控端输入 ID 进行连接</DialogDescription>
              </div>
              <div class="fcc p-6 pt-0">
                <p class="text-4xl font-semibold">{roomId() || '----'}</p>
              </div>
            </DialogContent>
          </DialogContainer>
        </Portal>
      </Dialog>
    </>
  )
}
