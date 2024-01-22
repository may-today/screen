import { createSignal } from 'solid-js'
import { $currentSongId } from '@/stores/coreState'
import Logo from '@/components/common/Logo'
import LyricListView from '@/components/common/LyricListView'
import FloatControlBarStatusBar from '@/components/screen/FloatControlBarStatusBar'
import SongListSidebarContent from '@/components/common/SongListSidebarContent'
import FloatControlBarTimerInfoView from './FloatControlBarTimerInfoView'
import { Tabs } from '@ark-ui/solid'

export default () => {
  const [currentTab, setCurrentTab] = createSignal('song_list')

  $currentSongId.listen((songId) => {
    if (songId) {
      setCurrentTab('lyric_list')
    } else {
      setCurrentTab('song_list')
    }
  })

  return (
    <Tabs.Root
      class="flex flex-col w-70vw max-w-300px h-80vh sm:h-60vh overflow-hidden select-none"
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
      <div class="flex-1 text-sm overflow-hidden">
        <Tabs.Content value="song_list" class="h-full w-full overflow-hidden">
          <SongListSidebarContent />
        </Tabs.Content>
        <Tabs.Content value="lyric_list" class="h-full w-full flex flex-col overflow-hidden">
          <div class="flex-1 flex flex-col items-stretch overflow-hidden">
            <LyricListView />
          </div>
          <FloatControlBarTimerInfoView />
        </Tabs.Content>
      </div>
      <footer>
        <FloatControlBarStatusBar />
      </footer>
    </Tabs.Root>
  )
}