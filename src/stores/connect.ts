import { atom } from 'nanostores'
import type { Peer, DataConnection, PeerOptions } from 'peerjs'
import type { PeerAction, ConnectStatus } from '@/types'

export const $peerConnect = atom<DataConnection | null>(null)
export const $roomId = atom<string | null>(null)
export const $connectStatus = atom<ConnectStatus>('not-ready')

export const serverOptions = () =>
  ({
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
  if (connect) {
    connect.send(data)
  }
}

export const handlePeer = (peer: Peer) => {
  peer.on('disconnected', (err) => {
    $connectStatus.set('ready')
    console.log('peer disconnected', err)
  })
  peer.on('error', (err) => {
    $connectStatus.set('error')
    console.log('peer error', err)
  })
}
