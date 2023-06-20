import { atom } from 'nanostores'
import type { DataConnection } from 'peerjs'
import type { PeerAction } from '@/types'

export const $presenterConnect = atom<DataConnection | null>(null)
export const $controllerConnect = atom<DataConnection | null>(null)

export const sendDataToPresenter = (data: PeerAction) => {
  if ($controllerConnect.get()) {
    $controllerConnect.get()!.send(data)
  }
}
