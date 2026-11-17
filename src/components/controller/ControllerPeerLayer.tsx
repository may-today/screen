import { createSignal,Show } from 'solid-js'
import { Portal } from 'solid-js/web'
import { useStore } from '@nanostores/solid'
import { Peer, type DataConnection } from 'peerjs'
import { Dialog, PinInput, PinInputControl, PinInputInput } from '@ark-ui/solid'
import { X, Loader2, MoreHorizontal } from 'lucide-solid'
import { $peerConnect, $roomId, $connectStatus, setConnectStatus, $peerConnectList, $roomIdList, $roomStatus, updateRoomStatus } from '@/stores/connect'
import { $connectionDialogOpen } from '@/stores/ui'
import { getServerOptions, handlePeer, setCustomPeerHost, getCustomPeerHost } from '@/logic/connect'
import { $coreState } from '@/composables'
import Button from '@/components/common/Button'
import ConnectMessageDialog from '../common/ConnectMessageDialog'
import type { StateAction } from '@/types'
import { Index } from 'solid-js'
import React, { useState } from 'react';


export default () => {
  const connectStatus = useStore($connectStatus)
  const connectionDialogOpen = useStore($connectionDialogOpen)
  const sessionRoomId = sessionStorage.getItem('controllerRoomId')
  const uuid = sessionStorage.getItem('controllerUUID') || Math.random().toString(32).slice(2, 10)
  const serverOptions = getServerOptions()
  const customPeerHost = getCustomPeerHost()

  const [roomIdListText, setRoomIdListText] = createSignal('text')
  const [pinValue, setPinValue] = createSignal<string[]>(["", "", "", "", "", ""]);
  
  console.log('serverOptions', serverOptions)

  const peer = new Peer(uuid, serverOptions)
  peer.on('open', (id) => {
    setConnectStatus('ready')
    sessionStorage.setItem('controllerUUID', uuid)
  })
  handlePeer(peer)

  const handleInputDone = (e: { valueAsString: string }) => {
    handleConnectToPeer(e.valueAsString)
    setPinValue(["", "", "", "", "", ""])
  }

  const handleConnectToPeer = (roomId: string) => {
    const conn = peer.connect(roomId)
    setConnectStatus('connecting')
    updateRoomStatus(conn.peer,'connecting')
    handleConnection(conn)
  }

  const handleConnection = (conn: DataConnection) => {
    conn.on('open', () => {
      console.log('conn open', conn.peer)
      setConnectStatus('connected')
      updateRoomStatus(conn.peer,'connected')
      $peerConnect.set(conn)
      addPeerConnectList(conn)
      $connectionDialogOpen.set(false)
      $roomId.set(conn.peer)
      //避免屏幕端重启后 遥控器端重复添加roomId
      if(!$roomIdList.get().toString().includes(conn.peer)){
        addRoomIdList(conn.peer)
      }
      $coreState.pushSnapShot()
      sessionStorage.setItem('controllerRoomId', $roomIdList.get().toString())
    })
    conn.on('close', () => {
      console.log('conn close', conn.peer)
      const lastRoomIdList = $roomIdList.get()
  
      if(lastRoomIdList.length == 0){ //没有一个连接的时候 才是待连接状态
        setConnectStatus('ready')
      }else if(lastRoomIdList.length == 1 && lastRoomIdList[0]==conn.peer){ //一对一连接模式时 直接尝试重新连接
        setConnectStatus('connecting')
        updateRoomStatus(conn.peer,'connecting')
        setTimeout(() => {
            handleConnectToPeer(conn.peer)
        }, 3000) 
      }else if(lastRoomIdList.length >= 1 && lastRoomIdList.includes(conn.peer)){ //一对多模式 1.遥控器主动删除屏幕连接 2.屏幕F5刷新后自动重连
        
        setConnectStatus('connecting')
        updateRoomStatus(conn.peer,'connecting')
        setTimeout(() => {
            handleConnectToPeer(conn.peer)
        }, 3000)   

      }

      const peerConnectList = $peerConnectList.get()

    })
    conn.on('error', (err) => {
      console.log('conn error', err)
      $connectionDialogOpen.set(true)
    })
    conn.on('data', (data) => {
      setConnectStatus('connected')
      updateRoomStatus(conn.peer,'connected')
      const action = data as StateAction
      console.log('conn data', action)
      $coreState.receiveAction(action)

      //由屏幕端传过来的信息 可以由遥控端转发给另外的屏幕 实现一对多 多对多控制
      const connectList = $peerConnectList.get()
      if(connectList.length > 0){
        connectList.forEach((connect) => {
          if (connect && connect.open && connect.peer != conn.peer) {
            connect.send(action);
          }
        });
      }
    })
  }

  const handleSwitchPeerHost = () => {
    const promptAnswer = prompt('更换一个 Peer 服务器，请确保两端的服务器一致。', customPeerHost || '')
    setCustomPeerHost(promptAnswer)
  }

  const addPeerConnectList = (conn: DataConnection) =>{
    $peerConnectList.set([...$peerConnectList.get(), conn]);
  }

  const addRoomIdList = (rid: string) =>{
    $roomIdList.set([...$roomIdList.get(), rid]);
  }

  // 屏幕批量连接（提交框未做）
  const RoomIdListSubmit = () => {
    const currentValue = roomIdListText(); 
    if (!currentValue) {
      return;
    }

    // 2. 处理数据（例如分割成数组）
    const roomIds = currentValue.split(",");
    
  
    // 3. 执行后续逻辑，连接屏幕
    // handleConnectToPeer(sessionRoomId!)
    roomIds.forEach((item) =>{
      handleConnectToPeer(item)
    })
  };



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
              <PinInput.Root  autoFocus blurOnComplete value={pinValue()} onValueComplete={handleInputDone} class="mb-3">
                <PinInput.Control>
                  <Index each={[0, 1, 2, 3, 4, 5]}>{(id) => <PinInput.Input index={id()} />}</Index>
                </PinInput.Control>
                <PinInput.HiddenInput />
              </PinInput.Root>
              <Show when={sessionRoomId}>
                <div class="flex justify-center">
                  <Button size="small" variant="ghost" class="inline-flex rounded-xl border-1 bg-white" onClick={() =>{
                    if(sessionRoomId &&sessionRoomId.split(",").length > 1){
                      sessionRoomId.split(",").forEach((rid) =>{                      
                        handleConnectToPeer(rid)
                      })
                    }else{
                      handleConnectToPeer(sessionRoomId!)
                    }
                  }}>

                    <p class="op-50 text-black">连接到上次：{sessionRoomId?.replaceAll(","," & ")}</p>
                  </Button>
                </div>
              </Show>
              <Show when={false}>
                <div class="flex justify-center">
                <input
                  id="RoomIdList"
                  class="bg-transparent ring-0 h-12 outline-none text-sm placeholder:op-50 dark:placeholder:op-30 border-b border-gray-300 px-2"
                  type="text"
                  placeholder="输入多个屏幕id 以,分隔"
                  value={roomIdListText()}       // 绑定 value
                  onChange={(e) => setRoomIdListText(e.target.value) } // 绑定 onChange
                />

                <Button size="small" variant="ghost" class="inline-flex"  onClick={() => RoomIdListSubmit()}>             
                    <p class="op-50">连接多个屏幕</p>
                  </Button>
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
