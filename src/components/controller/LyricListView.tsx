import { For, Show, onMount, createEffect, on } from 'solid-js'
import { useStore } from '@nanostores/solid'
import clsx from 'clsx'
import { $coreState } from '@/composables'
import { $currentSongData } from '@/stores/data'
import { parseTime } from '@/logic/time'

export default () => {
  const { currentLyricLine, triggerAction } = $coreState
  const currentSongData = useStore($currentSongData)

  let scrollList: HTMLDivElement | null = null

  onMount(() => {
    scrollList = document.getElementById('scroll-list') as HTMLDivElement
  })

  createEffect(on(currentSongData, (v) => {
    if (scrollList) {
      scrollList.scrollTop = 0
    }
  }, { defer: true }));

  return (
    <div id="scroll-list" class="flex flex-col h-full overflow-y-auto">
      <Show when={currentSongData()?.detail}>
        <For each={currentSongData()!.detail}>
          {(line) => (
            <div
              class={
                clsx([
                  'relative flex items-start gap-2 px-6 py-2 border-b border-base hv-base',
                  currentLyricLine()?.startTime === line.time ? 'bg-base-200' : ''
                ])
              }
              onClick={() => { triggerAction({ type: 'set_time', payload: line.time}) }}
            >
              <Show when={line.time >= 0}>
                <div class={clsx([
                  'text-xs font-mono mt-1',
                  currentLyricLine()?.startTime === line.time ? 'font-bold fg-primary op-70' : 'op-30',
                ])}>
                  {parseTime(line.time)}
                </div>
              </Show>
              <div class={clsx([
                'flex-1',
                line.isHighlight ? 'fg-primary' : '',
                currentLyricLine()?.startTime === line.time ? 'font-bold' : ''
              ])}>
                {line.text}
              </div>
            </div>
          )}
        </For>
      </Show>
    </div>
  )
}