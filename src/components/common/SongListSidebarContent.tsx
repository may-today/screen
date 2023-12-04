import { createSignal } from 'solid-js'
import { Tabs } from '@ark-ui/solid'
import SongList from './sidebarTab/SongList'
import WebSearchList from './sidebarTab/WebSearchList'
import UploadLyricPanel from './sidebarTab/UploadLyricPanel'

export default () => {
  const [currentTab, setCurrentTab] = createSignal('local_list')

  return (
    <Tabs.Root
      class="w-full h-full flex flex-col"
      value={currentTab()}
      onValueChange={(e) => setCurrentTab(e.value!)}
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
      <Tabs.List class="flex items-center px-3 h-12 border-t border-base">
        <Tabs.Trigger value="local_list">本地曲库</Tabs.Trigger>
        <Tabs.Trigger value="web_list">网络搜索</Tabs.Trigger>
        <Tabs.Trigger value="upload">上传</Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>
  )
}