import { atom, action } from 'nanostores'
import { $statusText } from './ui'
import type { Peer, DataConnection, PeerOptions } from 'peerjs'
import type { PeerAction, ConnectStatus } from '@/types'

export const $peerConnect = atom<DataConnection | null>(null)
export const $roomId = atom<string | null>(null)
export const $connectStatus = atom<ConnectStatus>('not-ready')

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

export const serverOptions = () =>({
  host: 'peer.ddiu.io',
  port: window.location.protocol === 'https:' ? 443 : 80,
  config: {
    iceServers: [
      {
        urls: 'stun:stun.relay.metered.ca:80',
      },
      {
        urls: 'turn:a.relay.metered.ca:80',
        username: import.meta.env.PUBLIC_METERED_USER,
        credential: import.meta.env.PUBLIC_METERED_KEY,
      },
      {
        urls: 'turn:a.relay.metered.ca:80?transport=tcp',
        username: import.meta.env.PUBLIC_METERED_USER,
        credential: import.meta.env.PUBLIC_METERED_KEY,
      },
      {
        urls: 'turn:a.relay.metered.ca:443',
        username: import.meta.env.PUBLIC_METERED_USER,
        credential: import.meta.env.PUBLIC_METERED_KEY,
      },
      {
        urls: 'turn:a.relay.metered.ca:443?transport=tcp',
        username: import.meta.env.PUBLIC_METERED_USER,
        credential: import.meta.env.PUBLIC_METERED_KEY,
      },
    ],
  },
} as PeerOptions)

export const sendData = (data: PeerAction) => {
  const connect = $peerConnect.get()
  if (connect && connect.open) {
    connect.send(data)
  }
}

export const handlePeer = (peer: Peer) => {
  peer.on('disconnected', (err) => {
    setConnectStatus('ready')
    console.log('peer disconnected', err)
  })
  peer.on('error', (err) => {
    setConnectStatus('error')
    console.log('peer error', err)
  })
}
