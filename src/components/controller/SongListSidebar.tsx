import { createSignal } from 'solid-js'
import { Portal } from 'solid-js/web'
import { useStore } from '@nanostores/solid'
import { Dialog, DialogBackdrop, DialogContainer, DialogContent, Tabs } from '@ark-ui/solid'
import { $sidebarOpen } from '@/stores/ui'
import SongList from './sidebarTab/SongList'
import WebSearchList from './sidebarTab/WebSearchList'
import UploadLyricPanel from './sidebarTab/UploadLyricPanel'

export default () => {
  const [currentTab, setCurrentTab] = createSignal('local_list')
  const sidebarOpen = useStore($sidebarOpen)

  return (
    <Dialog open={sidebarOpen()} onOpen={() => $sidebarOpen.set(true)} onClose={() => $sidebarOpen.set(false)}>
      <Portal>
        <DialogBackdrop />
        <DialogContainer>
          <DialogContent asChild>
            <Tabs.Root
              class="sidebar flex flex-col"
              value={currentTab()}
              onChange={(e) => setCurrentTab(e.value!)}
            >
              <Tabs.Content value="local_list" class="flex-1 overflow-hidden">
                <SongList />
              </Tabs.Content>
              <Tabs.Content value="web_list" class="flex-1 overflow-hidden">
                <WebSearchList />
              </Tabs.Content>
              <Tabs.Content value="upload" class="flex-1 overflow-hidden">
                <UploadLyricPanel />
              </Tabs.Content>
              <Tabs.List class="px-4 py-2 border-t border-base">
                <Tabs.Trigger value="local_list">本地曲库</Tabs.Trigger>
                <Tabs.Trigger value="web_list">网络搜索</Tabs.Trigger>
                <Tabs.Trigger value="upload">上传</Tabs.Trigger>
              </Tabs.List>
            </Tabs.Root>
          </DialogContent>
        </DialogContainer>
      </Portal>
    </Dialog>
  )
}