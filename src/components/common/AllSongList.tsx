import { For, createMemo, createEffect } from 'solid-js'
import { useStore } from '@nanostores/solid'
import clsx from 'clsx'
import { $metaGroupList } from '@/stores/data'
import { $currentSongId } from '@/stores/coreState'
import { $coreState } from '@/composables'
import type { GroupListItem } from '@/types'

interface Props {
  class?: string
  onClick?: (songId: string) => void
  groupList?: GroupListItem[]
}

export default (props: Props) => {
  const metaGroupListStore = useStore($metaGroupList)
  const currentSongId = useStore($currentSongId)

  let scrollDiv: HTMLDivElement

  const groupList = createMemo(() => props.groupList ?? metaGroupListStore())

  createEffect(() => {
    groupList()
    scrollDiv.scrollTop = 0
  })

  const handleSongClick = (songId: string) => {
    if (props.onClick) {
      props.onClick(songId)
      return
    }
    $coreState.triggerAction({ type: 'set_id', payload: songId })
  }

  return (
    <div ref={scrollDiv!} class={`h-full overflow-auto ${props.class || ''}`}>
      <For each={groupList()}>
        {(group) => (
          <div>
            <h1 class="px-3 py-1 fg-primary font-bold">{group.index}</h1>
            <div>
              <For each={group.list}>
                {song => (
                  <div
                    class={clsx([
                      'flex items-center px-3 py-2 rounded hv-base',
                      song.slug === currentSongId() ? 'fg-primary font-bold bg-primary hover:bg-primary' : 'hover:bg-base-200'
                    ])}
                    onClick={() => handleSongClick(song.slug)}
                  >
                    { song.title }
                  </div>
                )}
              </For>
            </div>
          </div>
        )}
      </For>
    </div>
  )
}