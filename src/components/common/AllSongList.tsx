import { For } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { $groupMetaList } from '@/stores/data'
import { $currentSongId } from '@/stores/coreState'
import { $coreState } from '@/composables'

interface Props {
  class?: string
}

export default (props: Props) => {
  const groupMetaList = useStore($groupMetaList)
  const currentSongId = useStore($currentSongId)

  const handleSongClick = (songId: string) => {
    $coreState.triggerAction({ type: 'set_id', payload: songId })
  }

  return (
    <div class={`h-full overflow-auto ${props.class || ''}`}>
      <For each={Object.entries(groupMetaList())}>
        {([key, list]) => (
          <>
            <h1 class="px-3 py-1 fg-primary font-bold">{key}</h1>
            <div>
              <For each={list}>
                {song => (
                  <div
                    class={[
                      'flex items-center px-3 py-2 rounded hv-base',
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
}