import { atom } from 'nanostores'
import type { DataConnection } from 'peerjs'
import type { PeerAction } from '@/types'

export const $peerConnect = atom<DataConnection | null>(null)
export const $roomId = atom<string | null>(null)

export const sendData = (data: PeerAction) => {
  const connect = $peerConnect.get()
  if (connect) {
    connect.send(data)
  }
}