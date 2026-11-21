import { atom } from 'nanostores'
import { $statusText } from './ui'
import type { ConnectStatus } from '@/types'

export const $roomId = atom<string | null>(null)
export const $roomIdList = atom<string[]>([])
export const $connectStatus = atom<ConnectStatus>('not-ready')
export const $connectErrorMessage = atom<string | null>(null)
export const $roomStatus = atom(new Map<string, ConnectStatus>())

export const setConnectStatus = (status: ConnectStatus) => {
  $connectStatus.set(status)
  const statusText = getStatusTextByStatus(status)
  $statusText.set(statusText)
}

export const getStatusTextByStatus = (status: ConnectStatus) => {
  return {
    'not-ready': '初始化中',
    ready: '未连接',
    connecting: '正在连接',
    connected: '已连接',
    error: '连接失败',
  }[status]
}


export const updateRoomStatus = (roomId: string, newStatus: ConnectStatus) => {
  const currentMap = $roomStatus.get();
  const newMap = new Map(currentMap);
  newMap.set(roomId, newStatus);

  // SolidJS 检测到 newMap !== currentMap，从而触发 UI 更新
  $roomStatus.set(newMap);
};
