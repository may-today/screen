import { useStore } from '@nanostores/solid'
import { $groupData } from '@/stores/data'
import { $currentSongId, $sidebarOpen } from '@/stores/ui'
import { For } from 'solid-js'

export default () => {
  const groupData = useStore($groupData)
  const sidebarOpen = useStore($sidebarOpen)
  const currentSongId = useStore($currentSongId)

  const sidebarClass = () => sidebarOpen() ? 'translate-x-0' : '-translate-x-full'

  const handleSongClick = (songId: string) => {
    $currentSongId.set(songId)
    $sidebarOpen.set(false)
  }

  return (
    <aside class={`fixed top-0 left-0 bottom-0 w-[70vw] border-r border-base bg-base z-10 overflow-hidden transition-all ${sidebarClass()}`}>
      <div class="h-full py-4 px-2 overflow-auto">
        <For each={groupData()}>
          {group => (
            <>
              <h1 class="px-3 py-1 fg-primary font-bold">{group.key}</h1>
              <div>
                <For each={group.list}>
                  {song => (
                    <div
                    class={[
                      'flex items-center h-10 px-3 rounded hv-base hover:bg-base-100',
                      song.slug === currentSongId() ? 'bg-base-100' : ''
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
    </aside>
  )
}