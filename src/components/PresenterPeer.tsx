import { Peer } from 'peerjs'

export default () => {
  const peer = new Peer('ddiu-peer-presenter')

  console.log('presenter peer', peer)

  peer.on('connection', (conn) => {
    console.log('presenter peer connection', conn)
    conn.on('data', (data) => {
      console.log(data)
    })
    conn.on('open', () => {
      conn.send('Hello! I am the presenter.')
    })
  })

  return (
    <div class="p-6">
      peer
    </div>
  )
}