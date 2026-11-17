import { useStore } from '@nanostores/solid'
import { $connectStatus, $peerConnectList, $roomId, $roomIdList, $roomStatus } from '@/stores/connect'
import { $statusText, $connectionDialogOpen } from '@/stores/ui'
import Button from './Button'
import { Show, For, createSignal, createMemo } from 'solid-js'
import { Portal } from 'solid-js/web'
import { Plus } from 'lucide-solid';


export default () => {
  const connectStatus = useStore($connectStatus)
  const statusText = useStore($statusText)
  let noticeTextDom: HTMLDivElement
  const roomId = useStore($roomId)
  const roomIdList = useStore($roomIdList)
  const roomStatus = useStore($roomStatus)


  //新增：控制操作对话框的显示及选中的屏幕ID
  const [actionDialog, setActionDialog] = createSignal<{ open: boolean; roomId: string | null }>({
    open: false,
    roomId: null
  });

  const handleAction = (action: 'refresh' | 'close') => {
    const rid = actionDialog().roomId;
    if (!rid) return;

    if (action === 'refresh') {
      alert(`刷新连接: ${rid}`);
      // TODO: 在此处调用PeerJS 重连逻辑
    } else if (action === 'close') {
      $roomIdList.set($roomIdList.get().filter(item => item !== rid));
      sessionStorage.setItem('controllerRoomId', $roomIdList.get().toString())
      const peerConnectList = $peerConnectList.get()
      peerConnectList.forEach((conn,index) =>{
        if(conn.peer == rid){
          conn.close()
          console.log(`close connect: ${rid}`);
        }
      })
    }
    setActionDialog({ open: false, roomId: null });
  };


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
    // 兜底处理 undefined 情况
    const key = (status ?? 'not-ready') as keyof typeof STATUS_CLASS_MAP;
    return STATUS_CLASS_MAP[key];
  };

  const getRoomBgClass = (targetRoomId: string) => {
    const map = roomStatus(); // 读取最新的 Map
    const status = map.get(targetRoomId);
    // 兜底处理 undefined 情况
    const key = (status ?? 'not-ready') as keyof typeof ROOM_STATUS_CLASS_MAP;
    return ROOM_STATUS_CLASS_MAP[key];
  };



  return (
    <div class="flex items-center gap-1 -ml-1">     
      <Show when={1 == 1 && window.location.href.includes('screen')}>      
        <div class="p-1.5" onClick={() => $connectionDialogOpen.set(true)}>
          <div class={`h-2 w-2 rounded-full bg-gray ${statusDotClass()}`} />
        </div>
        <Show when={connectStatus() !== 'connected'}>
          <Button size="small" variant="outline" class="op-50" onClick={() => $connectionDialogOpen.set(true)}>连接</Button>
        </Show>
      </Show>
      <Show when={window.location.href.includes('controller')}>    
        <Show when={connectStatus() == 'not-ready' && roomIdList().length == 0}> 
          <div class="p-1.5" onClick={() => $connectionDialogOpen.set(true)}>
            <div class={`h-2 w-2 rounded-full bg-gray ${statusDotClass()}`} />
          </div>
        </Show> 
        <Show when={connectStatus() == 'ready' && roomIdList().length == 0}> 
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
                {/* <button
                  onClick={() => handleAction('refresh')}
                  class="w-full py-2.5 px-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  刷新连接
                </button> */}
                <button
                  onClick={() => handleAction('close')}
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
