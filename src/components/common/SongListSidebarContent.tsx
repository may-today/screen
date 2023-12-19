import { For, Show, createSignal } from 'solid-js'
import { useStore } from '@nanostores/solid'
import clsx from 'clsx'
import { Tabs, Menu } from '@ark-ui/solid'
import { ChevronsUpDown } from 'lucide-solid'
import { $coreState } from '@/composables'
import { $dataset } from '@/stores/coreState'
import { datasetConfig } from '@/assets/dataset'
import SongList from './sidebarTab/SongList'
import WebSearchList from './sidebarTab/WebSearchList'
import UploadLyricPanel from './sidebarTab/UploadLyricPanel'

export default () => {
  const [currentTab, setCurrentTab] = createSignal('local_list')
  const dataset = useStore($dataset)
  const currentDatasetInfo = () => (
    datasetConfig[dataset()] || null
  )

  const handleSelectDataset = ({value}: {value: string}) => {
    $coreState.triggerAction({ type: 'set_dataset', payload: value })
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
      <Tabs.List class="flex items-center px-3 h-12 border-t border-base">
        <Tabs.Trigger value="local_list">
          <Show when={currentTab() === 'local_list'} fallback={`${currentDatasetInfo().name}曲库`}>
            <Menu.Root onSelect={handleSelectDataset} highlightedId={dataset()}>
              <Menu.Trigger class="fcc gap-1 p-1 -m-1">
                <span>{currentDatasetInfo().name}曲库</span>
                <ChevronsUpDown size={16} />
              </Menu.Trigger>
              <Menu.Positioner>
                <Menu.Content>
                  <For each={Object.keys(datasetConfig)}>
                    {(key) => (
                      <Menu.Item
                        id={key}
                        class={clsx([
                          'flex items-center px-3 py-2 rounded hv-base',
                          key === dataset() ? 'fg-primary font-bold bg-primary hover:bg-primary' : 'hover:bg-base-200'
                        ])}
                      >
                        {datasetConfig[key].name}曲库
                      </Menu.Item>
                    )}
                  </For>
                </Menu.Content>
              </Menu.Positioner>
            </Menu.Root>
          </Show>
        </Tabs.Trigger>
        <Tabs.Trigger value="web_list">网络搜索</Tabs.Trigger>
        <Tabs.Trigger value="upload">上传</Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>
  )
}