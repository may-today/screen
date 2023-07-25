import { createSignal } from 'solid-js'
import { Peer } from 'peerjs'
import {
  Slider,
  SliderLabel,
  SliderControl,
  SliderThumb,
  SliderTrack,
  SliderRange,
} from '@ark-ui/solid'
import { $presenterConnect } from '@/stores/peer'
import type { ConnectState } from '@/types'

export default () => {
  const connectServerType = localStorage.getItem('server') || 'local'
  const [connectStatus, setConnectStatus] = createSignal<ConnectState>('none')
  const serverOptions = connectServerType === 'online' ? {
    host: 'peer.ddiu.io',
    port: window.location.protocol === 'https:' ? 443 : 80,
  } : {
    host: '192.168.0.200',
    port: 9000,
  }
  const peer = new Peer('ddiu-peer-presenter', serverOptions)

  peer.on('connection', (conn) => {
    console.log('conn connection', conn)
    $presenterConnect.set(conn)
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
    const promptAnswer = prompt('local/online', connectServerType)
    if (!promptAnswer) {
      return
    }
    if (promptAnswer.toLowerCase() === 'o' || promptAnswer.toLowerCase() === 'online') {
      localStorage.setItem('server', 'online')
      if (!connectServerType || connectServerType === 'local') {
        location.reload()
      }
    } else if (promptAnswer.toLowerCase() === 'l' || promptAnswer.toLowerCase() === 'local') {
      localStorage.setItem('server', 'local')
      if (connectServerType === 'online') {
        location.reload()
      }
    }
  }

  return (
    <div
      class="absolute flex items-center justify-center bottom-0 left-0 p-4 z-10"
      onClick={handleClick}
    >
      <div class={`h-1 w-1 rounded-full z-10 ${dotClass()}`} />
      <Slider>
        <SliderLabel>Label</SliderLabel>
        <SliderControl>
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
          <SliderThumb />
        </SliderControl>
      </Slider>
    </div>
  )
}