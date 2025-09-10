import { For } from 'solid-js'
import clsx from 'clsx'
import { Popover } from '@ark-ui/solid'
import { useStore } from '@nanostores/solid'
import { Ellipsis, Download, Upload, Trash } from 'lucide-solid'
import { $coreState } from '@/composables'
import { toaster } from '@/logic/toaster'
import { $sidebarOpen } from '@/stores/ui'
import { $favIdList, $favMetaList, clearFav, exportFavList, importFavList } from '@/stores/favList'
import { $currentSongData } from '@/stores/data'
import type { SongDetail } from '@/types'

export default () => {
  const favMetaList = useStore($favMetaList)
  const favIdList = useStore($favIdList)
  const currentSongData = useStore($currentSongData)

  const handleSongClick = async (slug: string) => {
    const currentFavMetaList = favMetaList()
    if (currentFavMetaList[slug]) {
      const singleTrack = JSON.parse(currentFavMetaList[slug].detailStr) as SongDetail
      $coreState.triggerAction({ type: 'set_single_track', payload: singleTrack })
      $sidebarOpen.set(false)
    }
  }

  const handleExport = () => {
    exportFavList()
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const success = await importFavList(file)
        if (success) {
          toaster.create({ title: '导入成功！' })
        } else {
          toaster.create({ title: '导入失败', description: '请检查文件格式是否正确。' })
        }
      }
    }
    input.click()
  }

  const SearchList = () => (
    <div class="flex-1 p-4 overflow-y-auto">
      <For each={Object.entries(favMetaList())}>
        {([slug, item], index) => (
          <div
            class={clsx([
              'flex items-center gap-2 px-3 py-2 rounded hv-base',
              slug === currentSongData()?.slug
                ? 'fg-primary font-bold bg-primary hover:bg-primary'
                : 'hover:bg-base-200',
            ])}
            onClick={() => handleSongClick(slug)}
          >
            <div class="text-sm op-50 w-6">{index() + 1}</div>
            <span>{item.title}</span>
          </div>
        )}
      </For>
    </div>
  )

  const ListInfo = () => (
    <div class="relative flex items-center justify-between gap-2 h-12 border-t border-base px-4">
      <div class="text-sm op-50">收藏列表 · {favIdList().length}</div>
      <Popover.Root modal>
        <Popover.Trigger class="fcc gap-1 p-1 -m-1">
          <Ellipsis class="op-50" size={20} />
        </Popover.Trigger>
        <Popover.Positioner>
          <Popover.Content class="py-1">
            <Popover.CloseTrigger
              class="flex items-center gap-2 px-4 py-2 rounded hv-base text-sm"
              onClick={handleImport}
            >
              <Upload size={16} />
              导入
            </Popover.CloseTrigger>
            <Popover.CloseTrigger
              class="flex items-center gap-2 px-4 py-2 rounded hv-base text-sm"
              onClick={handleExport}
            >
              <Download size={16} />
              导出
            </Popover.CloseTrigger>
            <Popover.CloseTrigger
              class="flex items-center gap-2 px-4 py-2 rounded hv-base text-sm text-red-400"
              onClick={() => clearFav()}
            >
              <Trash size={16} />
              清空
            </Popover.CloseTrigger>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Root>
    </div>
  )

  return (
    <div class="h-full flex flex-col">
      <SearchList />
      <ListInfo />
    </div>
  )
}
