import { createSignal,Show } from 'solid-js'
import { Portal } from 'solid-js/web'
import { useStore } from '@nanostores/solid'
import { Peer, type DataConnection } from 'peerjs'
import { Dialog, PinInput, PinInputControl, PinInputInput } from '@ark-ui/solid'
import { X, Loader2, MoreHorizontal } from 'lucide-solid'
import { $peerConnect, $roomId, $connectStatus, setConnectStatus, $peerConnectList, $roomIdList } from '@/stores/connect'
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
      setConnectStatus('ready')
      const lastRoomIdList = $roomIdList.get()
      if(lastRoomIdList.length > 0){
        setTimeout(() => {
          lastRoomIdList.forEach((rid) => {
            handleConnectToPeer(rid)
          })
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

  const addPeerConnectList = (conn: DataConnection) =>{
    $peerConnectList.set([...$peerConnectList.get(), conn]);
  }

  const addRoomIdList = (rid: string) =>{
    $roomIdList.set([...$roomIdList.get(), rid]);
  }

  // 3. 处理按钮点击
  const RoomIdListSubmit = () => {
    const currentValue = roomIdListText(); 
    if (!currentValue) {
      console.warn("请输入房间 ID");
      return;
    }

    // 2. 处理数据（例如分割成数组）
    const roomIds = currentValue.split(",");
    
  
    // 3. 执行后续逻辑，连接屏幕
    // handleConnectToPeer(sessionRoomId!)
    roomIds.forEach((item) =>{
      //alert(item)
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
              <Show when={connectStatus() === 'ready' || connectStatus() === 'error'}>
                <PinInput.Root autoFocus blurOnComplete onValueComplete={handleInputDone} class="mb-3">
                  <PinInput.Control>
                    <Index each={[0, 1, 2, 3, 4, 5]}>{(id) => <PinInput.Input index={id()} />}</Index>
                  </PinInput.Control>
                  <PinInput.HiddenInput />
                </PinInput.Root>
                <Show when={sessionRoomId}>
                  <div class="flex justify-center">
                    <Button size="small" variant="ghost" class="inline-flex" onClick={() =>{
                      if(sessionRoomId &&sessionRoomId.split(",").length > 1){
                        sessionRoomId.split(",").forEach((rid) =>{                      
                          handleConnectToPeer(rid)
                        })
                      }else{
                        handleConnectToPeer(sessionRoomId!)
                      }
                    }}>

                      <p class="op-50">连接到上次：{sessionRoomId?.replace(","," & ")}</p>
                    </Button>
                  </div>
                </Show>
                <Show when={true}>
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
