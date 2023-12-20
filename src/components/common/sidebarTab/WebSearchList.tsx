import { For, createSignal } from 'solid-js'
import { Portal } from 'solid-js/web'
import clsx from 'clsx'
import { Toast, createToaster } from '@ark-ui/solid'
import { Search, X } from 'lucide-solid'
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
    const lyricList = await getLyricByTrackId(song.id)
    if (!lyricList) {
      setIsLoading(false)
      toast().create({ title: '下载失败', description: '获取不到该歌曲的歌词' })
      return
    }
    const singleTrack: SongDetail = {
      title: song.name,
      slug: song.id,
      index: '',
      meta: {
        artist: song.artists_str,
      },
      detail: lyricList,
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

  const [Toaster, toast] = createToaster({
    placement: 'top-end',
    duration: 3000,
    render(toast) {
      return (
        <Toast.Root>
          <Toast.Title>{toast().title}</Toast.Title>
          <Toast.Description>{toast().description}</Toast.Description>
          <Toast.CloseTrigger class="fcc w-8 h-8 bg-transparent">
            <X size={20} />
          </Toast.CloseTrigger>
        </Toast.Root>
      )
    },
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
        <Toaster />
      </Portal>
    </>
  )
}