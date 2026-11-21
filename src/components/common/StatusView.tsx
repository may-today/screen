import { Dialog } from '@ark-ui/solid'
import { useStore } from '@nanostores/solid'
import { Plus, X } from 'lucide-solid'
import { For, Show, onCleanup, onMount } from 'solid-js'
import { Portal } from 'solid-js/web'
import { forgetRoom } from '@/logic/connect'
import { $connectStatus, $roomIdList, $roomStatus, getStatusTextByStatus } from '@/stores/connect'
import { $statusText, $connectionDialogOpen } from '@/stores/ui'
import type { ConnectStatus } from '@/types'

const dotClass: Record<ConnectStatus, string> = {
  'not-ready': 'bg-neutral-400/50',
  ready: 'bg-neutral-400/50',
  connected: 'bg-emerald-400/60',
  connecting: 'bg-amber-400/65',
  error: 'bg-red-400/70',
}

export default (props: { controller?: boolean }) => {
  const connectStatus = useStore($connectStatus)
  const roomIds = useStore($roomIdList)
  const roomStatus = useStore($roomStatus)
  const statusText = useStore($statusText)
  const openPairing = () => $connectionDialogOpen.set(true)
  let notice!: HTMLDivElement

  onMount(() => {
    let timer: ReturnType<typeof setTimeout>
    const unsubscribe = $statusText.listen(() => {
      clearTimeout(timer)
      notice.classList.remove('anim-text-out')
      timer = setTimeout(() => notice.classList.add('anim-text-out'), 2000)
    })
    onCleanup(() => {
      clearTimeout(timer)
      unsubscribe()
    })
  })

  return (
    <div class="flex min-w-0 items-center gap-1 -ml-1">
      <Show when={props.controller && roomIds().length > 0} fallback={
        <button type="button" class="fcc gap-1.5 rounded-md bg-transparent text-neutral-300 hv-base px-1.5 h-7 text-xs"
          aria-label={`连接设置，${getStatusTextByStatus(connectStatus())}`} onClick={openPairing}>
          <span class={`h-1.5 w-1.5 rounded-full ${dotClass[connectStatus()]}`} />
          <Show when={connectStatus() !== 'connected'}>连接</Show>
        </button>
      }>
        <For each={roomIds()}>{id => {
          const status = () => roomStatus().get(id) ?? 'not-ready'
          const label = () => `屏幕 ${id}，${getStatusTextByStatus(status())}`
          return (
            <Dialog.Root lazyMount unmountOnExit>
              <Dialog.Trigger class="fcc shrink-0 gap-1 rounded-md border border-base bg-transparent text-neutral-300 hv-base h-6 px-1 sm:px-1.5"
                aria-label={label()} title={label()}>
                <span class={`h-1.5 w-1.5 rounded-full ${dotClass[status()]}`} />
                <span class="font-mono text-xs">{id}</span>
              </Dialog.Trigger>
              <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                  <Dialog.Content class="relative">
                    <div class="flex flex-col space-y-1.5 p-6 pb-3">
                      <Dialog.Title>屏幕 <span class="font-mono">{id}</span></Dialog.Title>
                      <Dialog.Description>{getStatusTextByStatus(status())}</Dialog.Description>
                    </div>
                    <div class="px-6 pt-3 pb-6">
                      <button type="button" class="rounded-md bg-base-100 px-4 py-2 text-sm"
                        onClick={() => forgetRoom(id)}>断开连接</button>
                    </div>
                    <Dialog.CloseTrigger class="absolute top-2 right-2 fcc w-8 h-8 bg-transparent" aria-label="关闭">
                      <X size={20} />
                    </Dialog.CloseTrigger>
                  </Dialog.Content>
                </Dialog.Positioner>
              </Portal>
            </Dialog.Root>
          )
        }}</For>
        <Show when={roomIds().length < 3}>
          <button type="button" class="fcc h-7 w-7 shrink-0 rounded-md bg-transparent text-neutral-300 hv-base"
            title="新增连接" aria-label="新增连接" onClick={openPairing}>
            <Plus size={14} />
          </button>
        </Show>
      </Show>
      <div class="min-w-0 truncate text-xs fg-lighter" ref={notice}>{statusText()}</div>
    </div>
  )
}
