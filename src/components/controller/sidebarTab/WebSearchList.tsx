import { For, createSignal } from 'solid-js'
import { Search } from 'lucide-solid'
import { debounce } from '@solid-primitives/scheduled'
import { $coreState } from '@/composables'
import { getTrackListByKeyword, getLyricByTrackId, type WebSearchTrackItem } from '@/logic/singleTrack'
import { parseTime } from '@/logic/time'
import { $sidebarOpen } from '@/stores/ui'
import type { SongDetail } from '@/types'

export default () => {
  let inputRef: HTMLInputElement
  const [inputText, setInputText] = createSignal<string>('')
  const [filteredList, setFilteredList] = createSignal<WebSearchTrackItem[]>([])

  const handleSongClick = async (song: WebSearchTrackItem) => {
    const lyricList = await getLyricByTrackId(song.id)
    if (!lyricList) {
      // TODO: show error message
      return
    }
    const singleTrack: SongDetail = {
      title: song.name,
      slug: song.id,
      meta: {
        artist: song.artists_str,
      },
      detail: lyricList,
    }
    $coreState.triggerAction({ type: 'set_single_track', payload: singleTrack })
    setInputText('')
    inputRef.value = ''
    setFilteredList([])
    $sidebarOpen.set(false)
  }

  const handleInput = () => {
    const input = inputRef.value
    setInputText(input)
    if (!input) {
      setFilteredList([])
      return
    }
    debounceHandleSearch(input)
  }

  const handleSearch = async (str: string) => {
    const filteredList = await getTrackListByKeyword(str)
    setFilteredList(filteredList)
  }
  const debounceHandleSearch = debounce(handleSearch, 1000)

  const SearchList = () => (
    <div class="flex-1 p-4 overflow-y-auto">
      <For each={filteredList()}>
        {item => (
          <div
            class={[
              'px-3 py-2 rounded hv-base',
              'hover:bg-base-200',
            ].join(' ')}
            onClick={() => handleSongClick(item)}
          >
            <div>
              <span>{ item.name }</span>
              <span class="text-xs op-50 ml-2">{ parseTime(item.duration) }</span>
            </div>
            <div class="text-xs line-clamp-5 op-50 fg-primary">{ item.artists_str }</div>
            <div class="text-xs line-clamp-5 op-50">{ item.album?.name }</div>
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
          placeholder="输入歌名搜索网络歌词"
        />
      </div>
    </div>
  )

  return (
    <div class="h-full flex flex-col">
      <SearchList />
      <SearchBox />
    </div>
  )
}