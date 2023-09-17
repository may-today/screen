import { createSignal } from 'solid-js'
import { Portal } from 'solid-js/web'
import { useStore } from '@nanostores/solid'
import { Peer, type DataConnection } from 'peerjs'
import clsx from 'clsx'
import { Dialog, DialogBackdrop, DialogCloseTrigger, DialogContainer, DialogContent, DialogDescription, DialogTitle } from '@ark-ui/solid'
import { Tooltip, TooltipContent, TooltipPositioner, TooltipTrigger } from '@ark-ui/solid'
import { $peerConnect, $roomId, $connectStatus, handlePeer } from '@/stores/connect'
import { X, HelpCircle } from 'lucide-solid'

export default () => {
  const [showDialog, setShowDialog] = createSignal(true)
  const roomId = useStore($roomId)
  const connectStatus = useStore($connectStatus)

  const serverOptions = {
    host: 'peer.ddiu.io',
    port: window.location.protocol === 'https:' ? 443 : 80,
  }
  const sessionRoomId = sessionStorage.getItem('roomId')
  const peer = sessionRoomId ? new Peer(sessionRoomId, serverOptions) : new Peer(serverOptions)

  peer.on('open', (id) => {
    $roomId.set(id)
    $connectStatus.set('ready')
    sessionStorage.setItem('roomId', id)
  })
  handlePeer(peer)

  peer.on('connection', (conn) => {
    $peerConnect.set(conn)
    setShowDialog(false)
    handleConnection(conn)
  })

  const statusDotClass = () =>({
    'not-ready': 'bg-gray/40',
    ready: 'bg-gray',
    connecting: 'bg-yellow-500',
    connected: 'bg-green-700',
    error: 'bg-red',
  }[connectStatus()])

  const handleConnection = (conn: DataConnection) => {
    conn.on('open', () => {
      $connectStatus.set('connected')
    })
    conn.on('close', () => {
      $connectStatus.set('ready')
    })
    conn.on('error', (err) => {
      console.log('conn error', err)
      $connectStatus.set('error')
    })
  }

  return (
    <>
      <button class={clsx(['absolute flex items-center justify-center gap-1 bottom-1 left-1', 'bg-transparent p-2 z-10'])} onClick={() => setShowDialog(true)}>
        <div class={`h-1.5 w-1.5 rounded-full z-10 ${statusDotClass()}`} />
        {/* <div class="text-xs">未连接</div> */}
      </button>
      <Dialog open={showDialog()} onClose={() => setShowDialog(false)} closeOnEsc={false} closeOnOutsideClick={false} trapFocus={false}>
        <Portal>
          <DialogBackdrop />
          <DialogContainer>
            <DialogContent class="relative black">
              <div class="flex flex-col space-y-1.5 p-6 pb-3">
                <DialogTitle>连接遥控器</DialogTitle>
                <DialogDescription>请在遥控端输入 ID 进行连接</DialogDescription>
              </div>
              <div class="p-6 pt-3">
                <p class="text-4xl text-center font-semibold mb-6">{roomId() || '------'}</p>
                <div class="flex items-center gap-1">
                  <p class="text-sm fg-lighter">屏幕端与遥控器需在同一局域网下</p>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle class="fg-lighter" size={14} />
                    </TooltipTrigger>
                    <Portal>
                      <TooltipPositioner>
                        <TooltipContent>我们将使用 WebRTC 连接。为保证最好的连接效果，请尽量让设备连接到同一个网络。</TooltipContent>
                      </TooltipPositioner>
                    </Portal>
                  </Tooltip>
                </div>
              </div>
              <DialogCloseTrigger class="absolute top-2 right-2 fcc w-8 h-8 bg-transparent">
                <X size={20} />
              </DialogCloseTrigger>
            </DialogContent>
          </DialogContainer>
        </Portal>
      </Dialog>
    </>
  )
}
