import { useStore } from '@nanostores/solid'
import { $connectStatus, $roomIdList, $roomStatus } from '@/stores/connect'
import { $statusText, $connectionDialogOpen } from '@/stores/ui'
import { forgetRoom } from '@/logic/connect'
import Button from './Button'
import { Show, For, createSignal } from 'solid-js'
import { Portal } from 'solid-js/web'


export default () => {
  const connectStatus = useStore($connectStatus)
  const statusText = useStore($statusText)
  let noticeTextDom: HTMLDivElement
  const roomIdList = useStore($roomIdList)
  const roomStatus = useStore($roomStatus)


  //新增：控制操作对话框的显示及选中的屏幕ID
  const [actionDialog, setActionDialog] = createSignal<{ open: boolean; roomId: string | null }>({
    open: false,
    roomId: null
  });

  const disconnect = () => {
    const id = actionDialog().roomId
    if (id) forgetRoom(id)
    setActionDialog({ open: false, roomId: null })
  }

  $statusText.listen((v) => {
    noticeTextDom.classList.remove('anim-text-out')
    setTimeout(() => {
      noticeTextDom.classList.add('anim-text-out')
    }, 2000)
  })

  // 定义通用的状态类名映射，供两个函数复用
  const STATUS_CLASS_MAP = {
    'not-ready': 'bg-gray/40',
    ready: 'bg-gray',
    connecting: 'bg-yellow-500',
    connected: 'bg-green-700',
    error: 'bg-red',
  } as const;


  const ROOM_STATUS_CLASS_MAP = {
    ready: 'bg-gray',
    connecting: 'bg-yellow-400',
    connected: 'bg-green-400',
    error: 'bg-red-400',
  } as const;

  const statusDotClass = () => {
    const status = connectStatus();
    return STATUS_CLASS_MAP[status as keyof typeof STATUS_CLASS_MAP] || 'bg-gray/40';
  }


  const getRoomDotClass = (targetRoomId: string) => {
    const map = roomStatus(); // 读取最新的 Map
    const status = map.get(targetRoomId);
    const key = (status ?? 'not-ready') as keyof typeof STATUS_CLASS_MAP;
    return STATUS_CLASS_MAP[key];
  };

  const getRoomBgClass = (targetRoomId: string) => {
    const map = roomStatus(); // 读取最新的 Map
    const status = map.get(targetRoomId);
    const key = (status ?? 'not-ready') as keyof typeof ROOM_STATUS_CLASS_MAP;
    return ROOM_STATUS_CLASS_MAP[key];
  };

  // 域名中也带有screen字段 不能使用window.location.href.includes('screen')判断屏幕端和遥控器端 使用pathname排除域名干扰
  const pathStr = new URL(window.location.href).pathname;
  const isScreen = pathStr.includes('screen');
  const isController = pathStr.includes('controller');

  return (
    <div class="flex items-center gap-1 -ml-1">     
      <Show when={isScreen}>      
        <div class="p-1.5" onClick={() => $connectionDialogOpen.set(true)}>
          <div class={`h-2 w-2 rounded-full bg-gray ${statusDotClass()}`} />
        </div>
        <Show when={connectStatus() !== 'connected'}>
          <Button size="small" variant="outline" class="op-50" onClick={() => $connectionDialogOpen.set(true)}>连接</Button>
        </Show>
      </Show>
      <Show when={isController}>    
        <Show when={roomIdList().length === 0}>
          <div class="p-1.5" onClick={() => $connectionDialogOpen.set(true)}>
            <div class={`h-2 w-2 rounded-full bg-gray ${statusDotClass()}`} />
          </div>
          <Button size="small" variant="outline" class="op-50" onClick={() => $connectionDialogOpen.set(true)}>连接</Button>
        </Show>
        <Show when={roomIdList().length > 0 }>   
          <For each={roomIdList()}>
            {(roomId, index) => (
              <div class={`flex items-center gap-1  rounded-xl border-2  ${getRoomBgClass(roomId)}`} 
                onClick={() => setActionDialog({ open: true, roomId })}>
                <p  class="op-60 text-center font-semibold pl-1 pr-1 text-black">{roomId}</p>
              </div>
            )}
          </For>
          <Show when={roomIdList().length <= 2}>  
            <Button size="small" variant="outline" class="op-50" onClick={() => $connectionDialogOpen.set(true)}>新增连接</Button>
          </Show> 
        </Show>           
      </Show>
     
      <div class="text-sm fg-lighter" ref={noticeTextDom!}>{statusText()}</div>
      <Show when={actionDialog().open}>
        <Portal>
          <div 
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setActionDialog({ open: false, roomId: null })}
          >
            <div 
              class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-80 transform transition-all scale-100 border border-gray-100 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 class="text-lg font-bold mb-2 text-gray-800 dark:text-gray-100 text-center">
                操作屏幕: <span class="font-mono font-semibold text-blue-600 dark:text-blue-400">{actionDialog().roomId}</span>
              </h3>        
              <div class="space-y-3">
                <button
                  onClick={disconnect}
                  class="w-full py-2.5 px-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  断开连接
                </button>
              </div>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  )
}
