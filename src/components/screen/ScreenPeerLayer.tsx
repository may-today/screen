import { Portal } from 'solid-js/web'
import { useStore } from '@nanostores/solid'
import { Peer, type DataConnection } from 'peerjs'
import { Dialog } from '@ark-ui/solid'
import { Popover } from '@ark-ui/solid'
import { X, HelpCircle, MoreHorizontal } from 'lucide-solid'
import { $peerConnect, $roomId, setConnectStatus } from '@/stores/connect'
import { $connectionDialogOpen } from '@/stores/ui'
import { getServerOptions, handlePeer, setCustomPeerHost, getCustomPeerHost } from '@/logic/connect'
import { $coreState } from '@/composables'
import Button from '@/components/common/Button'
import ConnectMessageDialog from '../common/ConnectMessageDialog'
import type { StateAction } from '@/types'

export default () => {
  const roomId = useStore($roomId)
  const connectionDialogOpen = useStore($connectionDialogOpen)

  const sessionRoomId = sessionStorage.getItem('screenRoomId')
  const generatePin = () => Math.floor(Math.random() * 1e6).toString().padStart(6, '0')
  const serverOptions = getServerOptions()
  const customPeerHost = getCustomPeerHost()

  console.log('serverOptions', serverOptions)

  const peer = sessionRoomId ? new Peer(sessionRoomId, serverOptions) : new Peer(serverOptions)
  peer.on('open', (id) => {
    $roomId.set(id)
    setConnectStatus('ready')
    sessionStorage.setItem('screenRoomId', id)
  })
  handlePeer(peer)

  peer.on('connection', (conn) => {
    handleConnection(conn)
  })

  const handleConnection = (conn: DataConnection) => {
    conn.on('open', () => {
      setConnectStatus('connected')
      $peerConnect.set(conn)
      $connectionDialogOpen.set(false)
      $coreState.pushSnapShot()
    })
    conn.on('close', () => {
      setConnectStatus('ready')
    })
    conn.on('error', (err) => {
      console.log('conn error', err)
      setConnectStatus('error')
    })
    conn.on('data', (data) => {
      setConnectStatus('connected')
      const action = data as StateAction
      console.log('conn data', action)
      $coreState.receiveAction(action)
    })
  }

  const handleSwitchPeerHost = () => {
    const promptAnswer = prompt('更换一个 Peer 服务器，请确保两端的服务器一致。', customPeerHost || '')
    setCustomPeerHost(promptAnswer)
  }

  return (
    <Dialog.Root open={connectionDialogOpen()} onOpenChange={(e) => $connectionDialogOpen.set(e.open)} trapFocus={false}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content class="relative black">
            <div class="flex flex-col space-y-1.5 p-6 pb-3">
              <Dialog.Title>连接遥控器</Dialog.Title>
              <Dialog.Description>{ customPeerHost ? `自定义 Peer: ${customPeerHost}` : '请在遥控端输入 ID 进行连接' }</Dialog.Description>
            </div>
            <div class="p-6 pt-3">
              <p class="text-4xl text-center font-semibold mb-6">{roomId() || '------'}</p>
              <div class="flex items-center gap-1">
                <p class="text-sm fg-lighter">
                  建议在同一局域网下连接
                </p>
                <Popover.Root>
                  <Popover.Trigger>
                    <HelpCircle class="fg-lighter" size={14} />
                  </Popover.Trigger>
                  <Portal>
                    <Popover.Positioner>
                      <Popover.Content class="black sm z-50 p-4">我们将使用 WebRTC 连接。为保证最好的连接效果，请尽量让设备连接到同一个网络。</Popover.Content>
                    </Popover.Positioner>
                  </Portal>
                </Popover.Root>
              </div>
            </div>
            <div class="flex justify-end px-6 pb-6">
              <Button size="large" variant="secondary" class="px-4" onClick={() => $connectionDialogOpen.set(false)}>
                暂不连接
              </Button>
            </div>
            <div class="flex gap-1 absolute top-2 right-2">
              <div class="fcc w-8 h-8 cursor-pointer" onClick={handleSwitchPeerHost}>
                <MoreHorizontal size={20} />
              </div>
              <Dialog.CloseTrigger class="fcc w-8 h-8 bg-transparent">
                <X size={20} />
              </Dialog.CloseTrigger>
            </div>
          </Dialog.Content>
        </Dialog.Positioner>
        <ConnectMessageDialog />
      </Portal>
    </Dialog.Root>
  )
}
