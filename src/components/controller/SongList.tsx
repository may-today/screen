import { For, createSignal, Show } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { $groupMetaList, $allDataDict, $updateTime, searchByString, fetchAndUpdateData } from '@/stores/data'
import { $currentSongId, $sidebarOpen } from '@/stores/ui'
import { sendData } from '@/stores/connect'
import Button from '@/components/common/Button'
import type { SearchItem } from '@/types'

export default () => {
  const groupMetaList = useStore($groupMetaList)
  const allDataDict = useStore($allDataDict)
  const updateTime = useStore($updateTime)
  const sidebarOpen = useStore($sidebarOpen)
  const currentSongId = useStore($currentSongId)
  let inputRef: HTMLInputElement
  const [inputText, setInputText] = createSignal<string>('')
  const [filteredList, setFilteredList] = createSignal<SearchItem[]>([])

  const sidebarClass = () => sidebarOpen() ? 'translate-x-0' : '-translate-x-full'

  const handleSongClick = (songId: string) => {
    $currentSongId.set(songId)
    $sidebarOpen.set(false)
    setInputText('')
    inputRef.value = ''
    setFilteredList([])
  }

  const handleInput = () => {
    const input = inputRef.value
    setInputText(input)
    const filtered = searchByString(input, Object.values(allDataDict()))
    setFilteredList(filtered)
  }

  const handleClose = () => {
    $sidebarOpen.set(false)
    setInputText('')
    inputRef.value = ''
    setFilteredList([])
  }

  const handleUpdateData = () => {
    fetchAndUpdateData()
    sendData({ type: 'update_data', value: null })
  }

  return (
    <aside class={`fixed flex flex-col top-0 left-0 bottom-0 w-[70vw] max-w-[300px] border-r border-base bg-base z-10 overflow-hidden transition-all ${sidebarClass()}`}>
      <Show when={!inputText()}>
        <div class="flex-1 py-4 px-2 overflow-auto">
          <For each={Object.entries(groupMetaList())}>
            {([key, list]) => (
              <>
                <h1 class="px-3 py-1 fg-primary font-bold">{key}</h1>
                <div>
                  <For each={list}>
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
          <For each={filteredList()}>
            {song => (
              <div
                class={[
                  'px-3 py-2 rounded hv-base',
                  song.data.slug === currentSongId() ? 'fg-primary font-bold bg-primary hover:bg-primary' : 'hover:bg-base-200'
                ].join(' ')}
                onClick={() => handleSongClick(song.data.slug)}
              >
                <div>{ song.data.title }</div>
                <div class="text-xs line-clamp-5 op-50">{ song.matchLines }</div>
                <div class="text-xs line-clamp-5 op-50 fg-primary">{ song.highlightLines }</div>
              </div>
            )}
          </For>
        </div>
      </Show>
      <div class="flex items-center gap-2 h-14 border-t border-base px-4">
        <div class="flex-1">
          <input
            class="bg-transparent ring-0 h-14 outline-none text-sm placeholder:op-50 dark:placeholder:op-30"
            type="text"
            ref={inputRef!}
            onInput={handleInput}
            placeholder={ updateTime() || 'No data' }
          />
        </div>
        <Button icon="i-ph:arrows-clockwise" onClick={handleUpdateData} />
        <Button icon="i-ph:x" onClick={handleClose} />
      </div>
    </aside>
  )
}