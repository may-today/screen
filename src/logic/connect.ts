import type { Peer, PeerOptions } from 'peerjs'
import { $peerConnect, setConnectStatus } from '@/stores/connect'
import type { StateAction } from '@/types'

export const getServerOptions = () => {
  const customPeerHost = getCustomPeerHost()
  if (customPeerHost?.includes(':')) {
    const [host, port] = customPeerHost.split(':')
    return {
      host,
      port: Number(port),
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
    setConnectStatus('ready')
    console.log('peer disconnected', err)
    setTimeout(() => {
      setConnectStatus('connecting')
      console.log('reconnecting...')
      peer.reconnect()
    }, 500)
  })
  peer.on('error', (err) => {
    setConnectStatus('error')
    console.log('peer error', err)
  })
}