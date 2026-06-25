import { For, createSignal, Show, createMemo } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { Search, ListFilter } from 'lucide-solid'
import { $allDataDict } from '@/stores/data'
import { searchByString } from '@/logic/data'
import { $sidebarOpen } from '@/stores/ui'
import { $currentSongId } from '@/stores/coreState'
import type { SearchItem, SongMeta, GroupListItem } from '@/types'
import { $coreState } from '@/composables'
import AllSongList from '@/components/common/AllSongList'

type SortMode = 'name' | 'year' | 'album'

const sortModeOptions: { key: SortMode; label: string }[] = [
  { key: 'name', label: '按名称' },
  { key: 'year', label: '按发行时间' },
  { key: 'album', label: '按专辑' },
]

export default () => {
  const allDataDict = useStore($allDataDict)
  const currentSongId = useStore($currentSongId)
  let inputRef: HTMLInputElement
  const [inputText, setInputText] = createSignal<string>('')
  const [filteredList, setFilteredList] = createSignal<SearchItem[]>([])
  const [sortMode, setSortMode] = createSignal<SortMode>('name')
  const [showSortMenu, setShowSortMenu] = createSignal(false)

  const customGroupList = createMemo<GroupListItem[] | undefined>(() => {
    const mode = sortMode()
    if (mode === 'name') return undefined

    const songs = Object.values(allDataDict())

    if (mode === 'year') {
      const yearGroups: Record<string, SongMeta[]> = {}
      const others: SongMeta[] = []
      songs.forEach((song) => {
        const meta = { title: song.title, slug: song.slug, meta: song.meta } as SongMeta
        const year = song.meta?.year
        if (year) {
          const key = String(year)
          if (!yearGroups[key]) yearGroups[key] = []
          yearGroups[key].push(meta)
        } else {
          others.push(meta)
        }
      })
      const groups = Object.keys(yearGroups)
        .sort((a, b) => Number(b) - Number(a))
        .map((year) => ({ index: year, list: yearGroups[year] }))
      if (others.length) groups.push({ index: '其他', list: others })
      return groups
    }

    if (mode === 'album') {
      const albumGroups: Record<string, SongMeta[]> = {}
      const others: SongMeta[] = []
      songs.forEach((song) => {
        const meta = { title: song.title, slug: song.slug, meta: song.meta } as SongMeta
        const album = song.meta?.album
        if (album) {
          if (!albumGroups[album]) albumGroups[album] = []
          albumGroups[album].push(meta)
        } else {
          others.push(meta)
        }
      })
      const groups = Object.keys(albumGroups)
        .sort()
        .map((album) => ({ index: album, list: albumGroups[album] }))
      if (others.length) groups.push({ index: '其他', list: others })
      return groups
    }

    return undefined
  })

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
        {(song) => (
          <div
            class={[
              'px-3 py-2 rounded hv-base',
              song.data.slug === currentSongId()
                ? 'fg-primary font-bold bg-primary hover:bg-primary'
                : 'hover:bg-base-200',
            ].join(' ')}
            onClick={() => handleSongClick(song.data.slug)}
          >
            <div>{song.data.title}</div>
            <div class="text-xs line-clamp-5 op-50">{song.matchLines}</div>
            <div class="text-xs line-clamp-5 op-50 fg-primary">{song.highlightLines}</div>
          </div>
        )}
      </For>
    </div>
  )

  const SearchBox = () => (
    <div class="flex items-center gap-2 h-12 border-t border-base px-4">
      <Search size={16} class="fg-lighter" />
      <div class="flex-1">
        <input
          class="bg-transparent ring-0 h-12 outline-none text-sm placeholder:op-50 dark:placeholder:op-30"
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
      <div class="relative shrink-0">
        <Show when={showSortMenu()}>
          <div class="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
        </Show>
        <button
          class={`p-1 rounded bg-transparent hv-base ${sortMode() !== 'name' ? 'fg-primary' : 'fg-lighter'}`}
          onClick={() => setShowSortMenu((v) => !v)}
          title="排序方式"
        >
          <ListFilter size={16} />
        </button>
        <Show when={showSortMenu()}>
          <div class="absolute bottom-full right-0 mb-2 z-20 bg-base border border-base rounded-lg shadow-lg overflow-hidden py-1">
            <For each={sortModeOptions}>
              {(mode) => (
                <div
                  class={[
                    'px-4 py-2 text-sm whitespace-nowrap hv-base hover:bg-base-200',
                    sortMode() === mode.key ? 'fg-primary font-medium' : 'fg-base',
                  ].join(' ')}
                  onClick={() => {
                    setSortMode(mode.key)
                    setShowSortMenu(false)
                  }}
                >
                  {mode.label}
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  )

  return (
    <div class="h-full flex flex-col">
      <Show when={!inputText()}>
        <AllSongList class="flex-1 p-2" onClick={handleSongClick} groupList={customGroupList()} />
      </Show>
      <Show when={inputText()}>
        <SearchList />
      </Show>
      <SearchBox />
    </div>
  )
}
