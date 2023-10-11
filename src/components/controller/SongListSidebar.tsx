import { Portal } from 'solid-js/web'
import { useStore } from '@nanostores/solid'
import { Dialog, DialogBackdrop, DialogContainer, DialogContent } from '@ark-ui/solid'
import { $sidebarOpen } from '@/stores/ui'
import SongList from './SongList'

export default () => {
  const sidebarOpen = useStore($sidebarOpen)

  return (
    <Dialog open={sidebarOpen()} onOpen={() => $sidebarOpen.set(true)} onClose={() => $sidebarOpen.set(false)}>
      <Portal>
        <DialogBackdrop />
        <DialogContainer>
          <DialogContent class="sidebar flex flex-col">
            <SongList />
          </DialogContent>
        </DialogContainer>
      </Portal>
    </Dialog>
  )
}