import { createSignal } from 'solid-js'
import { $coreState } from '@/composables'
import Logo from '@/components/common/Logo'
import AllSongList from '@/components/common/AllSongList'
import LyricListView from '@/components/controller/LyricListView'
import FloatControlBarStatusBar from '@/components/screen/FloatControlBarStatusBar'
import { Tabs } from '@ark-ui/solid'

export default () => {
  let scrollDom: HTMLDivElement
  const [currentTab, setCurrentTab] = createSignal('song_list')

  const handleSongClick = (songId: string) => {
    $coreState.triggerAction({ type: 'set_id', payload: songId })
    setCurrentTab('lyric_list')
    scrollDom.scrollTo({ top: 0 })
  }

  return (
    <Tabs.Root
      class="flex flex-col w-70vw max-w-300px h-60vh overflow-hidden select-none"
      value={currentTab()}
      onValueChange={(e) => setCurrentTab(e.value!)}
    >
      <header class="flex items-center justify-between px-4 py-2 border-b border-base">
        <Logo />
        <Tabs.List>
          <Tabs.Trigger value="song_list">歌曲列表</Tabs.Trigger>
          <Tabs.Trigger value="lyric_list">歌词</Tabs.Trigger>
        </Tabs.List>
      </header>
      <div class="flex-1 overflow-y-scroll text-sm" ref={scrollDom!}>
        <Tabs.Content value="song_list">
          <AllSongList class="p-2" onClick={handleSongClick} />
        </Tabs.Content>
        <Tabs.Content value="lyric_list">
          <LyricListView />
        </Tabs.Content>
      </div>
      <footer>
        <FloatControlBarStatusBar />
      </footer>
    </Tabs.Root>
  )
}