import { createSignal } from 'solid-js'
import { Peer } from 'peerjs'
import { $presenterConnect } from '@/stores/peer'
import type { ConnectState } from '@/types'
import Welcome from './Welcome'

export default () => {
  return (
    <div class="fcc w-screen h-[100dvh] p-6">
      <Welcome />
    </div>
  )
}