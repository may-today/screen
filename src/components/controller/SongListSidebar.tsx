import { Portal } from 'solid-js/web'
import { useStore } from '@nanostores/solid'
import { Dialog } from '@ark-ui/solid'
import { $sidebarOpen } from '@/stores/ui'
import SongListSidebarContent from '@/components/common/SongListSidebarContent'

export default () => {
  const sidebarOpen = useStore($sidebarOpen)

  return (
    <Dialog open={sidebarOpen()} onOpenChange={(e) => $sidebarOpen.set(e.open)}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content class="sidebar">
            <SongListSidebarContent />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog>
  )
}