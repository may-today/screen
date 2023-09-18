import { Show, createSignal, createEffect, on } from 'solid-js'
import { Portal } from 'solid-js/web'
import { useStore } from '@nanostores/solid'
import { Peer, type DataConnection } from 'peerjs'
import { Dialog, DialogBackdrop, DialogContainer, DialogContent, DialogDescription, DialogTitle } from '@ark-ui/solid'
import { PinInput, PinInputControl, PinInputInput } from '@ark-ui/solid'
import { X, Loader2 } from 'lucide-solid'
import { $peerConnect, $roomId, $connectStatus, serverOptions, handlePeer } from '@/stores/connect'
import Logo from './Logo'

export default () => {
  const [showDialog, setShowDialog] = createSignal(true)
  const connectStatus = useStore($connectStatus)
  const uuid = sessionStorage.getItem('controllerUUID') || Math.random().toString(32).slice(2, 10)
  const peer = new Peer(uuid, serverOptions())
  let noticeTextDom: HTMLDivElement

  createEffect(on(connectStatus, (v) => {
    noticeTextDom.classList.remove('anim-text-out')
    setTimeout(() => {
      noticeTextDom.classList.add('anim-text-out')
    }, 2000)
  }))

  peer.on('open', (id) => {
    $connectStatus.set('ready')
    sessionStorage.setItem('controllerUUID', uuid)
  })
  handlePeer(peer)

  const statusDotClass = () =>({
    'not-ready': 'bg-gray/40',
    ready: 'bg-gray',
    connecting: 'bg-yellow-500',
    connected: 'bg-green-700',
    error: 'bg-red',
  }[connectStatus()])

  const statusText = () =>({
    'not-ready': '初始化中',
    ready: '',
    connecting: '正在连接',
    connected: '已连接',
    error: '连接失败',
  }[connectStatus()])

  const handleInputDone = (e: { valueAsString: string }) => {
    const conn = peer.connect(e.valueAsString)
    $connectStatus.set('connecting')
    handleConnection(conn)
  }

  const handleConnection = (conn: DataConnection) => {
    conn.on('open', function () {
      $connectStatus.set('connected')
      $peerConnect.set(conn)
      setShowDialog(false)
      $roomId.set(conn.peer)
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
      <div class="flex items-center justify-between h-10 px-4 border-t border-base">
        <div class="flex items-center gap-1.5 px-1">
          <div class={`h-2 w-2 rounded-full ${statusDotClass()}`} />
          <div class="text-sm fg-lighter" ref={noticeTextDom!}>{statusText()}</div>
        </div>
        <Logo />
      </div>
      <Dialog open={showDialog()} onClose={() => setShowDialog(false)} closeOnEsc={false} closeOnOutsideClick={false} trapFocus={false}>
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
    </>
  )
}
