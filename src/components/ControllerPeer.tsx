import { Peer } from 'peerjs'

export default () => {
  const peer = new Peer('ddiu-peer-controller')

  peer.on('open', id => {
    console.log('controller peer open', id)
  })

  setTimeout(() => {
    const conn = peer.connect('ddiu-peer-presenter')
    conn.on('open', () => {
      console.log('controller peer connection open')
      conn.send('Hello! I am the controller.')
    })
  }, 2000);

  return (
    <div class="p-6">
      peer
    </div>
  )
}