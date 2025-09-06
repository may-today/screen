import { For, createSignal } from 'solid-js'
import { Portal } from 'solid-js/web'
import clsx from 'clsx'
import { Toast, Toaster, createToaster } from '@ark-ui/solid'
import { Search, X } from 'lucide-solid'
import { debounce } from '@solid-primitives/scheduled'
import { $coreState } from '@/composables'
import { getTrackListByKeyword, getLyricBySongId, type WebSearchTrackItem } from '@/logic/singleTrack'
import { parseTime } from '@/logic/time'
import { parseRawLRCFile } from '@/logic/lyric'
import { $sidebarOpen } from '@/stores/ui'
import type { SongDetail } from '@/types'

export default () => {
  let inputRef: HTMLInputElement
  const [inputText, setInputText] = createSignal<string>('')
  const [filteredList, setFilteredList] = createSignal<WebSearchTrackItem[]>([])
  const [isLoading, setIsLoading] = createSignal<boolean>(false)

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
    setIsLoading(true)
    const filteredList = await getTrackListByKeyword(str) || []
    setFilteredList(filteredList)
    setIsLoading(false)
  }
  const debounceHandleSearch = debounce(handleSearch, 1000)

  const handleSongClick = async (song: WebSearchTrackItem) => {
    setIsLoading(true)
    const lyricText = await getLyricBySongId(song.id).catch(() => null)
    if (!lyricText) {
      setIsLoading(false)
      toaster.create({ title: '下载失败', description: '获取不到该歌曲的歌词' })
      return
    }
    const singleTrack: SongDetail = {
      title: song.song_name,
      slug: song.id,
      index: '',
      meta: {
        artist: song.artist,
      },
      detail: parseRawLRCFile(lyricText),
    }
    $coreState.triggerAction({ type: 'set_single_track', payload: singleTrack })
    clearInputState()
    $sidebarOpen.set(false)
    setIsLoading(false)
  }

  const clearInputState = () => {
    inputRef.value = ''
    setInputText('')
    setFilteredList([])
  }

  const toaster = createToaster({
    placement: 'top-end',
    duration: 3000,
  })

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
              <span>{ item.song_name }</span>
              <span class="text-xs op-50 ml-2">{ parseTime(item.duration) }</span>
            </div>
            <div class="text-xs line-clamp-5 op-50 fg-primary">{ item.artist }</div>
            <div class="text-xs line-clamp-5 op-50">{ item.album_name }</div>
          </div>
        )}
      </For>
    </div>
  )

  const SearchBox = () => (
    <div class="relative flex items-center gap-2 h-12 border-t border-base px-4">
      <div class={clsx([
        'absolute top-0 left-0 right-0 h-[1px]',
        isLoading() ? 'loading-anim' : 'bg-transparent',
      ])} />
      <Search size={16} class="fg-lighter" />
      <div class="flex-1">
        <input
          class="bg-transparent ring-0 h-12 outline-none text-sm placeholder:op-50 dark:placeholder:op-30"
          type="text"
          ref={inputRef!}
          onInput={handleInput}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              clearInputState()
            } else if (e.key === 'Enter') {
              inputRef.blur()
            }
          }}
          placeholder="输入歌名搜索网络歌词"
        />
      </div>
    </div>
  )

  return (
    <>
      <div class="h-full flex flex-col">
        <SearchList />
        <SearchBox />
      </div>
      <Portal>
        <Toaster toaster={toaster}>
          {(toast) => (
              <Toast.Root>
                <Toast.Title>{toast().title}</Toast.Title>
                <Toast.Description>{toast().description}</Toast.Description>
                <Toast.CloseTrigger class="fcc w-8 h-8 bg-transparent">
                  <X size={20} />
                </Toast.CloseTrigger>
              </Toast.Root>
          )}
        </Toaster>
      </Portal>
    </>
  )
}