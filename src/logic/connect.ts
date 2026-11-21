import type { Peer, PeerOptions, DataConnection } from 'peerjs'
import { setConnectStatus, $connectErrorMessage, $roomIdList, updateRoomStatus } from '@/stores/connect'
import type { StateAction } from '@/types'

export const getServerOptions = () => {
  const customPeerHost = getCustomPeerHost()
  if (customPeerHost?.includes(':')) {
    const [host, port] = customPeerHost.split(':')
    const isIp = host.split('.').length === 4
    return {
      host,
      port: Number(port),
      secure: !isIp,
      config: import.meta.env.PUBLIC_STUN_HOST ? {
        iceServers: [
          { url: import.meta.env.PUBLIC_STUN_HOST },
          { url: import.meta.env.PUBLIC_TURN_HOST, username: import.meta.env.PUBLIC_TURN_USERNAME, credential: import.meta.env.PUBLIC_TURN_PASSWORD },
        ],
      } : undefined,
    } as PeerOptions
  }
  return {
    host: 'peer.ddiu.site',
    port: 443,
    secure: true,
  } as PeerOptions
}

// Includes pending channels so a second pairing cannot start another dial.
const channels = new Map<string, { conn: DataConnection; finish: (failed: boolean) => void }>()
const retries = new Map<string, ReturnType<typeof setTimeout>>()
const seen = new Set<string>()
const sender = Math.random().toString(36).slice(2)
let sequence = 0

const remember = (id: string) => {
  seen.add(id)
  if (seen.size > 4096) seen.delete(seen.values().next().value!)
}

const broadcast = (action: StateAction, except?: DataConnection) => {
  for (const { conn } of channels.values()) {
    if (conn.open && conn !== except) conn.send(action)
  }
}

export const sendAction = (action: StateAction, except?: DataConnection) => {
  const messageId = sender + '-' + ++sequence
  remember(messageId)
  broadcast({ ...action, messageId }, except)
}

export const refreshConnectStatus = (fallback: 'ready' | 'error' = 'ready') => {
  const connected = Array.from(channels.values()).some(({ conn }) => conn.open)
  setConnectStatus(connected ? 'connected' : channels.size || retries.size ? 'connecting' : fallback)
}

export const trackChannel = (
  conn: DataConnection,
  onOpen: () => void,
  onData: (action: StateAction) => void,
  onEnd: (failed: boolean) => void,
) => {
  const current = () => channels.get(conn.peer)?.conn === conn
  const finish = (failed: boolean) => {
    if (!current()) return
    clearTimeout(timeout)
    channels.delete(conn.peer)
    conn.close()
    onEnd(failed)
  }
  const timeout = setTimeout(() => finish(true), 15000)
  channels.set(conn.peer, { conn, finish })
  conn.on('open', () => {
    clearTimeout(timeout)
    if (!current()) return conn.close()
    onOpen()
  })
  conn.on('close', () => finish(false))
  conn.on('error', () => finish(true))
  conn.on('data', data => {
    if (!current()) return
    const action = data as StateAction
    const id = action.messageId
    if (id && seen.has(id)) return
    if (id) remember(id)
    onData(action)
    if (id) broadcast(action, conn)
    else sendAction(action, conn)
  })
}

export const hasChannel = (roomId: string) => channels.has(roomId)

export const closeChannel = (roomId: string) => {
  channels.get(roomId)?.finish(false)
}

export const retryRoom = (roomId: string, dial: (roomId: string) => void) => {
  if (retries.has(roomId) || !$roomIdList.get().includes(roomId)) return
  updateRoomStatus(roomId, 'connecting')
  retries.set(roomId, setTimeout(() => {
    retries.delete(roomId)
    if ($roomIdList.get().includes(roomId)) dial(roomId)
  }, 3000))
}

export const forgetRoom = (roomId: string) => {
  $roomIdList.set($roomIdList.get().filter(id => id !== roomId))
  sessionStorage.setItem('controllerRoomId', $roomIdList.get().join(','))
  clearTimeout(retries.get(roomId))
  retries.delete(roomId)
  closeChannel(roomId)
  refreshConnectStatus()
}

export const getCustomPeerHost = () => {
  return sessionStorage.getItem('peerServer')
}

export const setCustomPeerHost = (host: string | null) => {
  if (!host) {
    sessionStorage.removeItem('peerServer')
    location.reload()
  } else if (host?.includes(':')) {
    sessionStorage.setItem('peerServer', host)
    location.reload()
  }
}

export const handlePeer = (peer: Peer) => {
  peer.on('disconnected', (err) => {
    console.log('peer disconnected', err)
    if ($connectErrorMessage.get()) {
      return
    }
    refreshConnectStatus()
    setTimeout(() => {
      if (peer.destroyed || !peer.disconnected) return
      console.log('reconnecting...')
      peer.reconnect()
    }, 500)
  })
  peer.on('error', (err) => {
    if (err.type === 'peer-unavailable') {
      const roomId = err.message.match(/^Could not connect to peer (.+)$/)?.[1]
      const channel = roomId && channels.get(roomId)
      if (channel && !channel.conn.open) channel.finish(true)
      return
    }
    refreshConnectStatus('error')
    console.log('peer error', err)
    const fatalErrorMessage = {
      'browser-incompatible': '当前浏览器不支持连接功能，请尝试更换浏览器或使用单机模式。',
      'invalid-id': null,
      'invalid-key': null,
      'ssl-unavailable': null,
      'server-error': '服务器错误，请稍后再试。',
      'socket-error': null,
      'socket-closed': null,
      'unavailable-id': null,
    } as Record<string, string | null>
    if (Object.keys(fatalErrorMessage).includes(err.type)) {
      $connectErrorMessage.set(fatalErrorMessage[err.type] || err.message)
    }
  })
}
