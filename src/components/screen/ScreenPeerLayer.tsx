import { createSignal } from 'solid-js'
import { Portal } from 'solid-js/web'
import { useStore } from '@nanostores/solid'
import { Peer, type DataConnection } from 'peerjs'
import { Dialog, DialogBackdrop, DialogCloseTrigger, DialogContainer, DialogContent, DialogDescription, DialogTitle } from '@ark-ui/solid'
import { Popover, PopoverArrow, PopoverCloseTrigger, PopoverContent, PopoverDescription, PopoverArrowTip, PopoverPositioner, PopoverTitle, PopoverTrigger } from '@ark-ui/solid'
import { $peerConnect, $roomId, setConnectStatus, serverOptions, handlePeer } from '@/stores/connect'
import { X, HelpCircle } from 'lucide-solid'

export default () => {
  const [showDialog, setShowDialog] = createSignal(true)
  const [showTooltip, setShowTooltip] = createSignal(false)
  const roomId = useStore($roomId)

  const sessionRoomId = sessionStorage.getItem('roomId')
  const peer = sessionRoomId ? new Peer(sessionRoomId, serverOptions()) : new Peer(serverOptions())

  peer.on('open', (id) => {
    $roomId.set(id)
    setConnectStatus('ready')
    sessionStorage.setItem('roomId', id)
  })
  handlePeer(peer)

  peer.on('connection', (conn) => {
    handleConnection(conn)
  })

  const handleConnection = (conn: DataConnection) => {
    conn.on('open', () => {
      setConnectStatus('connected')
      $peerConnect.set(conn)
      setShowDialog(false)
    })
    conn.on('close', () => {
      setConnectStatus('ready')
    })
    conn.on('error', (err) => {
      console.log('conn error', err)
      setConnectStatus('error')
    })
  }

  return (
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
                <p class="text-sm fg-lighter">
                  建议在同一局域网下连接
                </p>
                <Popover>
                  <PopoverTrigger>
                    <HelpCircle class="fg-lighter" size={14} />
                  </PopoverTrigger>
                  <PopoverPositioner>
                    <PopoverContent>我们将使用 WebRTC 连接。为保证最好的连接效果，请尽量让设备连接到同一个网络。</PopoverContent>
                  </PopoverPositioner>
                </Popover>
              </div>
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
