import { For, createSignal, Show } from 'solid-js'
import { Portal } from 'solid-js/web'
import { useStore } from '@nanostores/solid'
import { Search } from 'lucide-solid'
import { Dialog, DialogBackdrop, DialogContainer, DialogContent } from '@ark-ui/solid'
import { $groupMetaList, $allDataDict } from '@/stores/data'
import { searchByString } from '@/logic/data'
import { $sidebarOpen } from '@/stores/ui'
import { $currentSongId } from '@/stores/mainState'
import type { SearchItem } from '@/types'
import { $mainState } from '@/composables'

export default () => {
  const groupMetaList = useStore($groupMetaList)
  const allDataDict = useStore($allDataDict)
  const sidebarOpen = useStore($sidebarOpen)
  const currentSongId = useStore($currentSongId)
  let inputRef: HTMLInputElement
  const [inputText, setInputText] = createSignal<string>('')
  const [filteredList, setFilteredList] = createSignal<SearchItem[]>([])

  const sidebarClass = () => sidebarOpen() ? 'translate-x-0' : '-translate-x-full'

  const handleSongClick = (songId: string) => {
    $mainState.handleAction({ type: 'set_id', payload: songId })
    $sidebarOpen.set(false)
    setInputText('')
    inputRef.value = ''
    setFilteredList([])
  }

  const handleInput = () => {
    const input = inputRef.value
    setInputText(input)
    const filtered = searchByString(input, Object.values(allDataDict()))
    setFilteredList(filtered)
  }

  const handleClose = () => {
    $sidebarOpen.set(false)
    setInputText('')
    inputRef.value = ''
    setFilteredList([])
  }

  const SongList = () => (
    <div class="flex-1 p-4 overflow-y-auto">
      <For each={Object.entries(groupMetaList())}>
        {([key, list]) => (
          <>
            <h1 class="px-3 py-1 fg-primary font-bold">{key}</h1>
            <div>
              <For each={list}>
                {song => (
                  <div
                    class={[
                      'flex items-center h-10 px-3 rounded hv-base',
                      song.slug === currentSongId() ? 'fg-primary font-bold bg-primary hover:bg-primary' : 'hover:bg-base-200'
                    ].join(' ')}
                    onClick={() => handleSongClick(song.slug)}
                  >
                    { song.title }
                  </div>
                )}
              </For>
            </div>
          </>
        )}
      </For>
    </div>
  )

  const SearchList = () => (
    <div class="flex-1 p-4 overflow-y-auto">
      <For each={filteredList()}>
        {song => (
          <div
            class={[
              'px-3 py-2 rounded hv-base',
              song.data.slug === currentSongId() ? 'fg-primary font-bold bg-primary hover:bg-primary' : 'hover:bg-base-200'
            ].join(' ')}
            onClick={() => handleSongClick(song.data.slug)}
          >
            <div>{ song.data.title }</div>
            <div class="text-xs line-clamp-5 op-50">{ song.matchLines }</div>
            <div class="text-xs line-clamp-5 op-50 fg-primary">{ song.highlightLines }</div>
          </div>
        )}
      </For>
    </div>
  )

  const SearchBox = () => (
    <div class="flex items-center gap-2 h-14 border-t border-base px-4">
      <Search size={16} class="fg-lighter" />
      <div class="flex-1">
        <input
          class="bg-transparent ring-0 h-14 outline-none text-sm placeholder:op-50 dark:placeholder:op-30"
          type="text"
          ref={inputRef!}
          onInput={handleInput}
          placeholder="输入歌名或歌词搜索"
        />
      </div>
    </div>
  )

  return (
    <Dialog open={sidebarOpen()} onOpen={() => $sidebarOpen.set(true)} onClose={() => $sidebarOpen.set(false)}>
      <Portal>
        <DialogBackdrop />
        <DialogContainer>
          <DialogContent class="sidebar flex flex-col">
            <Show when={!inputText()}>
              <SongList />
            </Show>
            <Show when={inputText()}>
              <SearchList />
            </Show>
            <SearchBox />
          </DialogContent>
        </DialogContainer>
      </Portal>
    </Dialog>
  )
}