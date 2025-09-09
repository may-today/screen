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
import { $favDict, $favIdList } from '@/stores/favList'
import type { SongDetail } from '@/types'
import { useStore } from '@nanostores/solid'

export default () => {
  const favDict = useStore($favDict)
  const favIdList = useStore($favIdList)

  const handleSongClick = async (song: WebSearchTrackItem) => {
    // setIsLoading(true)
    // const lyricText = await getLyricBySongId(song.id).catch(() => null)
    // if (!lyricText) {
    //   setIsLoading(false)
    //   toaster.create({ title: '下载失败', description: '获取不到该歌曲的歌词' })
    //   return
    // }
    // const singleTrack: SongDetail = {
    //   title: song.song_name,
    //   slug: song.id,
    //   index: '',
    //   meta: {
    //     artist: song.artist,
    //   },
    //   detail: parseRawLRCFile(lyricText),
    // }
    // $coreState.triggerAction({ type: 'set_single_track', payload: singleTrack })
    // clearInputState()
    // $sidebarOpen.set(false)
    // setIsLoading(false)
  }

  const SearchList = () => (
    <div class="flex-1 p-4 overflow-y-auto">
      <div>{JSON.stringify(favIdList())}</div>
      <For each={favIdList()}>
        {slug => (
          <div
            class={clsx([
              'flex items-center px-3 py-2 rounded hv-base',
              // song.slug === currentSongId() ? 'fg-primary font-bold bg-primary hover:bg-primary' : 'hover:bg-base-200'
            ])}
            // onClick={() => handleSongClick(song.slug)}
          >
            { favDict()[slug]?.title }
          </div>
          // <div
          //   class={[
          //     'px-3 py-2 rounded hv-base',
          //     'hover:bg-base-200',
          //   ].join(' ')}
          //   onClick={() => handleSongClick(item)}
          // >
          //   <div>
          //     <span>{ item.title }</span>
          //     <span class="text-xs op-50 ml-2">{ parseTime(item.meta.duration) }</span>
          //   </div>
          //   <div class="text-xs line-clamp-5 op-50 fg-primary">{ item.meta.artist }</div>
          //   <div class="text-xs line-clamp-5 op-50">{ item.meta.album }</div>
          // </div>
        )}
      </For>
    </div>
  )

  const ListInfo = () => (
    <div class="relative flex items-center gap-2 h-12 border-t border-base px-4">
      <div class="text-sm op-50">收藏列表 · { Object.values(favDict()).length }</div>
    </div>
  )

  return (
    <div class="h-full flex flex-col">
      <SearchList />
      <ListInfo />
    </div>
  )
}