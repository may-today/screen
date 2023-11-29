import { Show } from 'solid-js'
import { Portal } from 'solid-js/web'
import { useStore } from '@nanostores/solid'
import { Peer, type DataConnection } from 'peerjs'
import { Dialog } from '@ark-ui/solid'
import { PinInput, PinInputControl, PinInputInput } from '@ark-ui/solid'
import { X, Loader2, MoreHorizontal } from 'lucide-solid'
import { $peerConnect, $roomId, $connectStatus, setConnectStatus } from '@/stores/connect'
import { $connectionDialogOpen } from '@/stores/ui'
import { getServerOptions, handlePeer, setCustomPeerHost, getCustomPeerHost } from '@/logic/connect'
import { $coreState } from '@/composables'
import Button from '@/components/common/Button'
import ConnectMessageDialog from '../common/ConnectMessageDialog'
import type { StateAction } from '@/types'

export default () => {
  const connectStatus = useStore($connectStatus)
  const connectionDialogOpen = useStore($connectionDialogOpen)
  const sessionRoomId = sessionStorage.getItem('roomId')
  const uuid = sessionStorage.getItem('controllerUUID') || Math.random().toString(32).slice(2, 10)
  const serverOptions = getServerOptions()
  const customPeerHost = getCustomPeerHost()

  console.log('serverOptions', serverOptions)
  
  const peer = new Peer(uuid, serverOptions)
  peer.on('open', (id) => {
    setConnectStatus('ready')
    sessionStorage.setItem('controllerUUID', uuid)
  })
  handlePeer(peer)

  const handleInputDone = (e: { valueAsString: string }) => {
    handleConnectToPeer(e.valueAsString)
  }

  const handleConnectToPeer = (roomId: string) => {
    const conn = peer.connect(roomId)
    setConnectStatus('connecting')
    handleConnection(conn)
  }

  const handleConnection = (conn: DataConnection) => {
    conn.on('open', () => {
      console.log('conn open', conn.peer)
      setConnectStatus('connected')
      sessionStorage.setItem('roomId', conn.peer)
      $peerConnect.set(conn)
      $connectionDialogOpen.set(false)
      $roomId.set(conn.peer)
      $coreState.pushSnapShot()
    })
    conn.on('close', () => {
      setConnectStatus('ready')
      const lastRoomId = $roomId.get()
      if (lastRoomId) {
        setTimeout(() => {
          handleConnectToPeer(lastRoomId)
        }, 3000)
      }
    })
    conn.on('error', (err) => {
      console.log('conn error', err)
      $connectionDialogOpen.set(true)
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
    <Dialog open={connectionDialogOpen()} onOpenChange={(e) => !e.open && $connectionDialogOpen.set(false)} trapFocus={false}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content class="relative">
            <div class="flex flex-col space-y-1.5 p-6 pb-3">
              <Dialog.Title>连接屏幕</Dialog.Title>
              <Dialog.Description>{ customPeerHost ? `自定义 Peer: ${customPeerHost}` : '请输入屏幕 ID 进行连接' }</Dialog.Description>
            </div>
            <div class="p-6 pt-3">
              <Show when={connectStatus() === 'ready' || connectStatus() === 'error'}>
                <PinInput autoFocus blurOnComplete onValueComplete={handleInputDone} class="mb-3">
                  <PinInputControl>
                    <PinInputInput index={0} />
                    <PinInputInput index={1} />
                    <PinInputInput index={2} />
                    <PinInputInput index={3} />
                    <PinInputInput index={4} />
                    <PinInputInput index={5} />
                  </PinInputControl>
                </PinInput>
                <Show when={sessionRoomId}>
                  <div class="flex justify-center">
                    <Button size="small" variant="ghost" class="inline-flex" onClick={() => handleConnectToPeer(sessionRoomId!)}>
                      <p class="op-50">连接到上次：{sessionRoomId}</p>
                    </Button>
                  </div>
                </Show>
              </Show>
              <Show when={connectStatus() === 'not-ready' || connectStatus() === 'connecting'}>
                <div class="fcc gap-2">
                  <Loader2 class="animate-spin" />
                  {connectStatus() === 'not-ready' && <div class="text-sm">正在准备...</div>}
                  {connectStatus() === 'connecting' && <div class="text-sm">正在连接...</div>}
                </div>
              </Show>
              <Show when={connectStatus() === 'error'}>
                <div class="fcc gap-2 text-red-400">
                  <X size={20} />
                  <div class="text-sm">连接失败，请重试</div>
                </div>
              </Show>
            </div>
            <div class="flex gap-1 absolute top-2 right-2">
              <div class="fcc w-8 h-8 cursor-pointer" onClick={handleSwitchPeerHost}>
                <MoreHorizontal size={20} />
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Positioner>
        <ConnectMessageDialog />
      </Portal>
    </Dialog>
  )
}
