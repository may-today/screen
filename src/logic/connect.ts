import type { Peer, PeerOptions } from 'peerjs'
import { $peerConnect, setConnectStatus, $connectErrorMessage } from '@/stores/connect'
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

export const sendAction = (action: StateAction) => {
  const connect = $peerConnect.get()
  if (connect && connect.open) {
    connect.send(action)
  }
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
    setConnectStatus('ready')
    setTimeout(() => {
      setConnectStatus('connecting')
      console.log('reconnecting...')
      peer.reconnect()
    }, 500)
  })
  peer.on('error', (err) => {
    setConnectStatus('error')
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