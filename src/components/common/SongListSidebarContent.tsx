import { For, Show, createSignal } from 'solid-js'
import { useStore } from '@nanostores/solid'
import clsx from 'clsx'
import { Tabs, Popover } from '@ark-ui/solid'
import { ChevronsUpDown, ListMusic } from 'lucide-solid'
import { $coreState } from '@/composables'
import { $dataset } from '@/stores/coreState'
import { datasetConfig } from '@/assets/dataset'
import SongList from './sidebarTab/SongList'
import WebSearchList from './sidebarTab/WebSearchList'
import UploadLyricPanel from './sidebarTab/UploadLyricPanel'
import FavList from './sidebarTab/FavList'

export default () => {
  const [currentTab, setCurrentTab] = createSignal('local_list')
  const dataset = useStore($dataset)
  const currentDatasetInfo = () => (
    datasetConfig[dataset()] || null
  )

  const handleSelectDataset = (key: string) => {
    $coreState.triggerAction({ type: 'set_dataset', payload: key })
  }

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
      <Tabs.Content value="fav_list" class="flex-1 overflow-hidden">
        <FavList />
      </Tabs.Content>
      <Tabs.List class="flex items-center px-3 h-12 border-t border-base">
        <Tabs.Trigger value="local_list">
          <Show when={currentTab() === 'local_list'} fallback={`${currentDatasetInfo().name}曲库`}>
            <Popover.Root modal>
              <Popover.Trigger class="fcc gap-1 p-1 -m-1">
                <span>{currentDatasetInfo().name}曲库</span>
                <ChevronsUpDown size={16} />
              </Popover.Trigger>
              <Popover.Positioner>
                <Popover.Content class="py-1">
                  <For each={Object.keys(datasetConfig)}>
                    {(key) => (
                      <Popover.CloseTrigger
                        id={key}
                        class={clsx([
                          'flex items-center px-3 py-2 rounded hv-base',
                          key === dataset() ? 'fg-primary font-bold bg-primary hover:bg-primary' : 'hover:bg-base-200'
                        ])}
                        onClick={() => handleSelectDataset(key)}
                      >
                        {datasetConfig[key].name}曲库
                      </Popover.CloseTrigger>
                    )}
                  </For>
                </Popover.Content>
              </Popover.Positioner>
            </Popover.Root>
          </Show>
        </Tabs.Trigger>
        <Tabs.Trigger value="web_list">网络搜索</Tabs.Trigger>
        <Tabs.Trigger value="upload">上传</Tabs.Trigger>
        <div class="flex-1" />
        <Tabs.Trigger value="fav_list">
          <ListMusic size={20} />
        </Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>
  )
}