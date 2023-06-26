import { For, createSignal, Show } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { $groupData, $allData } from '@/stores/data'
import { $currentSongId, $sidebarOpen } from '@/stores/ui'
import Button from '../ui/Button'
import type { SongMeta } from '@/types'

interface SearchItem {
  data: SongMeta
  matchLine: string[]
  highlightLine: string[]
}

export default () => {
  const groupData = useStore($groupData)
  const allData = useStore($allData)
  const sidebarOpen = useStore($sidebarOpen)
  const currentSongId = useStore($currentSongId)
  let inputRef: HTMLInputElement
  const [inputText, setInputText] = createSignal<string>('')
  const [searchData, setSearchData] = createSignal<SearchItem[]>([])

  const sidebarClass = () => sidebarOpen() ? 'translate-x-0' : '-translate-x-full'

  const handleSongClick = (songId: string) => {
    $currentSongId.set(songId)
    $sidebarOpen.set(false)
  }

  const handleInput = () => {
    const input = inputRef.value
    setInputText(input)
    const allList = Object.values(allData())
    const filteredList = allList.filter(song => {
      return song.title.toLowerCase().includes(input.toLowerCase()) || song.content.toLowerCase().includes(input.toLowerCase())
    }).map(song => ({
      data: song,
      matchLine: song.detail.filter(line => line.text.toLowerCase().includes(input.toLowerCase())).map(line => line.text),
      highlightLine: song.detail.filter(line => line.isHighlight).map(line => line.text)
    }))
    setSearchData(filteredList)
    console.log(filteredList)
  }

  return (
    <aside class={`fixed flex flex-col top-0 left-0 bottom-0 w-[70vw] border-r border-base bg-base z-10 overflow-hidden transition-all ${sidebarClass()}`}>
      <Show when={!inputText()}>
        <div class="flex-1 py-4 px-2 overflow-auto">
          <For each={groupData()}>
            {group => (
              <>
                <h1 class="px-3 py-1 fg-primary font-bold">{group.key}</h1>
                <div>
                  <For each={group.list}>
                    {song => (
                      <div
                        class={[
                          'flex items-center h-10 px-3 rounded hv-base',
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
      </Show>
      <Show when={inputText()}>
        <div class="flex-1 py-4 px-2 overflow-auto">
          <For each={searchData()}>
            {song => (
              <div
                class={[
                  'px-3 py-2 rounded hv-base',
                  song.data.slug === currentSongId() ? 'fg-primary font-bold bg-primary hover:bg-primary' : 'hover:bg-base-200'
                ].join(' ')}
                onClick={() => handleSongClick(song.data.slug)}
              >
                <div>{ song.data.title }</div>
                <div class="text-xs line-clamp-5 op-50">{ song.matchLine.join(',') }</div>
                <div class="text-xs line-clamp-5 op-50 fg-primary">{ song.highlightLine.join('/') }</div>
                <div class="text-xs line-clamp-5 op-50">{ song.data.detail.map(item => item.text).join('/') }</div>
              </div>
            )}
          </For>
        </div>
      </Show>
      <div class="flex items-center h-14 border-t border-base px-4">
        <div class="flex-1">
          <input class="bg-transparent focus:(ring-0 outline-none)" type="text" ref={inputRef!} onInput={handleInput} />
        </div>
        <Button icon="i-ph:x" onClick={() => $sidebarOpen.set(false)} />
      </div>
    </aside>
  )
}