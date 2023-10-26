import { atom, action } from 'nanostores'
import { $statusText } from './ui'
import type { DataConnection } from 'peerjs'
import type { ConnectStatus } from '@/types'

export const $peerConnect = atom<DataConnection | null>(null)
export const $roomId = atom<string | null>(null)
export const $connectStatus = atom<ConnectStatus>('not-ready')
export const $connectErrorMessage = atom<string | null>(null)

export const setConnectStatus = action($connectStatus, 'setConnectStatus', (store, status: ConnectStatus) => {
  store.set(status)
  const statusText = getStatusTextByStatus(status)
  $statusText.set(statusText)
})

const getStatusTextByStatus = (status: ConnectStatus) => {
  return {
    'not-ready': '初始化中',
    ready: '未连接',
    connecting: '正在连接',
    connected: '已连接',
    error: '连接失败',
  }[status]
}

