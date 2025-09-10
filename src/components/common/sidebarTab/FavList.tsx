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
import { $favIdList, $favMetaList } from '@/stores/favList'
import type { SongDetail } from '@/types'
import { useStore } from '@nanostores/solid'

export default () => {
  const favMetaList = useStore($favMetaList)
  const favIdList = useStore($favIdList)

  const handleSongClick = async (slug: string) => {
    const currentFavMetaList = favMetaList()
    if (currentFavMetaList[slug]) {
      const singleTrack = JSON.parse(currentFavMetaList[slug].detailStr) as SongDetail
      $coreState.triggerAction({ type: 'set_single_track', payload: singleTrack })
      $sidebarOpen.set(false)
    }
  }

  const SearchList = () => (
    <div class="flex-1 p-4 overflow-y-auto">
      <For each={Object.entries(favMetaList())}>
        {([slug, item]) => (
          <div
            class={clsx([
              'flex items-center px-3 py-2 rounded hv-base',
              // song.slug === currentSongId() ? 'fg-primary font-bold bg-primary hover:bg-primary' : 'hover:bg-base-200'
            ])}
            onClick={() => handleSongClick(slug)}
          >
            { item.title }
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
      <div class="text-sm op-50">收藏列表 · { favIdList().length }</div>
    </div>
  )

  return (
    <div class="h-full flex flex-col">
      <SearchList />
      <ListInfo />
    </div>
  )
}