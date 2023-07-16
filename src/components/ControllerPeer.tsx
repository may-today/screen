import { createSignal } from 'solid-js'
import { Peer } from 'peerjs'
import { $controllerConnect } from '@/stores/peer'
import type { ConnectState } from '@/types'

export default () => {
  const urlSearchParams = new URLSearchParams(window.location.search)
  const params = Object.fromEntries(urlSearchParams.entries())
  const [connectStatus, setConnectStatus] = createSignal<ConnectState>('none')
  const serverOptions = params.server === 'online' ? {
    host: 'peer.ddiu.io',
    port: 80,
  } : {
    host: '192.168.0.200',
    port: 9000,
  }
  const peer = new Peer('ddiu-peer-controller', serverOptions)

  peer.on('open', (id) => {
    console.log('peer open', id)
    const conn = peer.connect('ddiu-peer-presenter')
    $controllerConnect.set(conn)
    conn.on('open', () => {
      console.log('conn open')
      setConnectStatus('connected')
    })
    conn.on('close', () => {
      console.log('conn close')
      setConnectStatus('none')
    })
    conn.on('error', (err) => {
      console.log('conn error', err)
      setConnectStatus('error')
    })
  })

  peer.on('disconnected', (err) => {
    setConnectStatus('none')
    console.log('peer disconnected', err)
  })
  peer.on('error', (err) => {
    setConnectStatus('error')
    console.log('peer error', err)
  })

  const dotClass = () => ({
    'none': 'bg-gray',
    'connected': 'bg-green-700',
    'error': 'bg-red',
  }[connectStatus()])

  const handleClick = () => {
    const promptAnswer = prompt('local/online', params.server || 'local')
    const currentUrl = new URL(window.location.href)
    if (!promptAnswer) {
      return
    }
    if (promptAnswer.toLowerCase() === 'o' || promptAnswer.toLowerCase() === 'online') {
      if (!params.server || params.server === 'local') {
        currentUrl.searchParams.set('server', 'online')
        location.replace(currentUrl.toString())
      }
    } else if (promptAnswer.toLowerCase() === 'l' || promptAnswer.toLowerCase() === 'local') {
      if (params.server === 'online') {
        currentUrl.searchParams.set('server', 'local')
        location.replace(currentUrl.toString())
      }
    }
  }

  return (
    <div
      class="absolute flex items-center justify-center bottom-0 left-0 h-5 w-5 z-10"
      onClick={handleClick}
    >
      <div class={`h-1 w-1 rounded-full z-10 ${dotClass()}`} />
    </div>
  )
}