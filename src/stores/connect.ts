import { atom } from 'nanostores'
import type { Peer, DataConnection } from 'peerjs'
import type { PeerAction, ConnectStatus } from '@/types'

export const $peerConnect = atom<DataConnection | null>(null)
export const $roomId = atom<string | null>(null)
export const $connectStatus = atom<ConnectStatus>('not-ready')

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
