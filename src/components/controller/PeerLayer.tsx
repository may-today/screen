import { Show, createSignal } from 'solid-js'
import { Portal } from 'solid-js/web'
import { useStore } from '@nanostores/solid'
import { Peer, type DataConnection } from 'peerjs'
import { Dialog, DialogBackdrop, DialogContainer, DialogContent, DialogDescription, DialogTitle } from '@ark-ui/solid'
import { PinInput, PinInputControl, PinInputInput } from '@ark-ui/solid'
import { X, Loader2 } from 'lucide-solid'
import { $peerConnect, $roomId, $connectStatus, setConnectStatus, serverOptions, handlePeer } from '@/stores/connect'

export default () => {
  const [showDialog, setShowDialog] = createSignal(true)
  const connectStatus = useStore($connectStatus)
  const uuid = sessionStorage.getItem('controllerUUID') || Math.random().toString(32).slice(2, 10)
  const peer = new Peer(uuid, serverOptions())

  peer.on('open', (id) => {
    setConnectStatus('ready')
    sessionStorage.setItem('controllerUUID', uuid)
  })
  handlePeer(peer)

  const handleInputDone = (e: { valueAsString: string }) => {
    const conn = peer.connect(e.valueAsString)
    setConnectStatus('connecting')
    handleConnection(conn)
  }

  const handleConnection = (conn: DataConnection) => {
    conn.on('open', function () {
      setConnectStatus('connected')
      $peerConnect.set(conn)
      setShowDialog(false)
      $roomId.set(conn.peer)
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
    <Dialog open={showDialog()} onClose={() => setShowDialog(false)} trapFocus={false}>
      <Portal>
        <DialogBackdrop />
        <DialogContainer>
          <DialogContent class="relative">
            <div class="flex flex-col space-y-1.5 p-6 pb-3">
              <DialogTitle>连接屏幕</DialogTitle>
              <DialogDescription>请输入屏幕 ID 进行连接</DialogDescription>
            </div>
            <div class="p-6 pt-3">
              <Show when={connectStatus() === 'ready' || connectStatus() === 'error'}>
                <PinInput autoFocus blurOnComplete onComplete={handleInputDone} class="mb-3">
                  <PinInputControl>
                    <PinInputInput index={0} />
                    <PinInputInput index={1} />
                    <PinInputInput index={2} />
                    <PinInputInput index={3} />
                    <PinInputInput index={4} />
                    <PinInputInput index={5} />
                  </PinInputControl>
                </PinInput>
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
          </DialogContent>
        </DialogContainer>
      </Portal>
    </Dialog>
  )
}
