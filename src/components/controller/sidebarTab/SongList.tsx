import { For, createSignal, Show } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { Search } from 'lucide-solid'
import { $allDataDict } from '@/stores/data'
import { searchByString } from '@/logic/data'
import { $sidebarOpen } from '@/stores/ui'
import { $currentSongId } from '@/stores/coreState'
import type { SearchItem } from '@/types'
import { $coreState } from '@/composables'
import AllSongList from '@/components/common/AllSongList'

export default () => {
  const allDataDict = useStore($allDataDict)
  const currentSongId = useStore($currentSongId)
  let inputRef: HTMLInputElement
  const [inputText, setInputText] = createSignal<string>('')
  const [filteredList, setFilteredList] = createSignal<SearchItem[]>([])

  const handleSongClick = (songId: string) => {
    $coreState.triggerAction({ type: 'set_id', payload: songId })
    $sidebarOpen.set(false)
    clearInputState()
  }

  const handleInput = () => {
    const input = inputRef.value
    setInputText(input)
    const filtered = searchByString(input, Object.values(allDataDict()))
    setFilteredList(filtered)
  }

  const clearInputState = () => {
    inputRef.value = ''
    setInputText('')
    setFilteredList([])
  }

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
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              clearInputState()
            } else if (e.key === 'Enter') {
              inputRef.blur()
            }
          }}
        />
      </div>
    </div>
  )

  return (
    <div class="h-full flex flex-col">
      <Show when={!inputText()}>
        <AllSongList class="flex-1 p-4" onClick={handleSongClick} />
      </Show>
      <Show when={inputText()}>
        <SearchList />
      </Show>
      <SearchBox />
    </div>
  )
}