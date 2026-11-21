import { createSignal, Index, Show } from 'solid-js'
import { Portal } from 'solid-js/web'
import { useStore } from '@nanostores/solid'
import { Peer } from 'peerjs'
import { Dialog, PinInput } from '@ark-ui/solid'
import { X, Loader2, MoreHorizontal } from 'lucide-solid'
import { $connectStatus, $roomIdList, updateRoomStatus } from '@/stores/connect'
import { $connectionDialogOpen } from '@/stores/ui'
import { getServerOptions, handlePeer, hasChannel, trackChannel, retryRoom, refreshConnectStatus, setCustomPeerHost, getCustomPeerHost } from '@/logic/connect'
import { $coreState } from '@/composables'
import ConnectMessageDialog from '../common/ConnectMessageDialog'

export default () => {
  const connectStatus = useStore($connectStatus)
  const connectionDialogOpen = useStore($connectionDialogOpen)
  const previousRooms = (sessionStorage.getItem('controllerRoomId') || '').split(',').filter(Boolean)
  const uuid = sessionStorage.getItem('controllerUUID') || Math.random().toString(32).slice(2, 10)
  const serverOptions = getServerOptions()
  const customPeerHost = getCustomPeerHost()

  const [pinValue, setPinValue] = createSignal<string[]>(["", "", "", "", "", ""]);
  
  const peer = new Peer(uuid, serverOptions)
  peer.on('open', () => {
    refreshConnectStatus()
    sessionStorage.setItem('controllerUUID', uuid)
  })
  handlePeer(peer)

  const handleInputDone = (e: { valueAsString: string }) => {
    handleConnectToPeer(e.valueAsString)
    setPinValue(["", "", "", "", "", ""])
  }

  const handleConnectToPeer = (roomId: string) => {
    if (hasChannel(roomId)) return
    if (!peer.open) {
      retryRoom(roomId, handleConnectToPeer)
      return
    }
    const conn = peer.connect(roomId, { reliable: true })
    trackChannel(conn, () => {
      if (!$roomIdList.get().includes(roomId)) {
        $roomIdList.set([...$roomIdList.get(), roomId])
      }
      sessionStorage.setItem('controllerRoomId', $roomIdList.get().join(','))
      updateRoomStatus(roomId, 'connected')
      refreshConnectStatus()
      $connectionDialogOpen.set(false)
      $coreState.pushSnapShot()
    }, $coreState.receiveAction, failed => {
      updateRoomStatus(roomId, failed ? 'error' : 'ready')
      retryRoom(roomId, handleConnectToPeer)
      refreshConnectStatus(failed ? 'error' : 'ready')
    })
    updateRoomStatus(roomId, 'connecting')
    refreshConnectStatus()
  }

  const handleSwitchPeerHost = () => {
    const promptAnswer = prompt('更换一个 Peer 服务器，请确保两端的服务器一致。', customPeerHost || '')
    setCustomPeerHost(promptAnswer)
  }

  return (
    <Dialog.Root open={connectionDialogOpen()} onOpenChange={(e) => !e.open && $connectionDialogOpen.set(false)} trapFocus={false}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content class="relative">
            <div class="flex flex-col space-y-1.5 p-6 pb-3">
              <Dialog.Title>连接屏幕</Dialog.Title>
              <Dialog.Description>{ customPeerHost ? `自定义 Peer: ${customPeerHost}` : '请输入屏幕 ID 进行连接' }</Dialog.Description>
            </div>
            <div class="p-6 pt-3"> 
              <PinInput.Root  autoFocus blurOnComplete value={pinValue()} onValueChange={e => setPinValue(e.value)} onValueComplete={handleInputDone} class="mb-3">
                <PinInput.Control>
                  <Index each={[0, 1, 2, 3, 4, 5]}>{(id) => <PinInput.Input index={id()} />}</Index>
                </PinInput.Control>
                <PinInput.HiddenInput />
              </PinInput.Root>
              <Show when={previousRooms.length > 0}>
                <div class="flex justify-center">
                  <button type="button" class="rounded-md border border-base bg-transparent text-neutral-300 hv-base px-2 py-1 text-xs"
                    onClick={() => previousRooms.forEach(handleConnectToPeer)}>
                    连接到上次：<span class="font-mono">{previousRooms.join(' · ')}</span>
                  </button>
                </div>
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
    </Dialog.Root>
  )
}
