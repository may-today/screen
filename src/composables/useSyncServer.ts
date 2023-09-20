import { $peerConnect } from '@/stores/connect'
import type { StateAction } from '@/types'

// TODO: sync state when connected
export const useSyncServer = () => {
  const send = (data: StateAction) => {
    const connect = $peerConnect.get()
    if (connect && connect.open) {
      connect.send(data)
    }
  }

  return [
    send,
  ] as const
}

export const $syncServer = useSyncServer()