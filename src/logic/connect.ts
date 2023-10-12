import type { Peer, PeerOptions } from 'peerjs'
import { $peerConnect, setConnectStatus } from '@/stores/connect'
import type { StateAction } from '@/types'

export const serverOptions1 = undefined as PeerOptions | undefined
export const serverOptions = {
  host: 'peer.ddiu.site',
  port: 443,
  secure: true,
  // debug: 3,
  // config: {
  //   iceServers: [
  //     {
  //       urls: 'stun:stun.relay.metered.ca:80',
  //     },
  //     {
  //       urls: 'turn:a.relay.metered.ca:80',
  //       username: import.meta.env.PUBLIC_METERED_USER,
  //       credential: import.meta.env.PUBLIC_METERED_KEY,
  //     },
  //     {
  //       urls: 'turn:a.relay.metered.ca:80?transport=tcp',
  //       username: import.meta.env.PUBLIC_METERED_USER,
  //       credential: import.meta.env.PUBLIC_METERED_KEY,
  //     },
  //     {
  //       urls: 'turn:a.relay.metered.ca:443',
  //       username: import.meta.env.PUBLIC_METERED_USER,
  //       credential: import.meta.env.PUBLIC_METERED_KEY,
  //     },
  //     {
  //       urls: 'turn:a.relay.metered.ca:443?transport=tcp',
  //       username: import.meta.env.PUBLIC_METERED_USER,
  //       credential: import.meta.env.PUBLIC_METERED_KEY,
  //     },
  //   ],
  // },
} as PeerOptions

export const sendAction = (action: StateAction) => {
  const connect = $peerConnect.get()
  if (connect && connect.open) {
    connect.send(action)
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