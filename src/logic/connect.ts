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
  const urlSearchParams = new URLSearchParams(window.location.search)
  const params = Object.fromEntries(urlSearchParams.entries())
  return params.server
}

export const setCustomPeerHost = (host: string | null) => {
  const currentUrl = new URL(window.location.href)
  if (!host) {
    currentUrl.searchParams.delete('server')
    location.replace(currentUrl.toString())
  } else if (host?.includes(':')) {
    currentUrl.searchParams.set('server', host)
    location.replace(currentUrl.toString())
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