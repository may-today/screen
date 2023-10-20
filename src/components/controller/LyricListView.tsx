import { For, Show, onMount, createEffect, on } from 'solid-js'
import { useStore } from '@nanostores/solid'
import clsx from 'clsx'
import { $coreState } from '@/composables'
import { $currentTimelineData } from '@/stores/data'
import { parseTime } from '@/logic/time'

export default () => {
  const { currentLyricLine, triggerAction } = $coreState
  const currentTimelineData = useStore($currentTimelineData)

  let scrollList: HTMLDivElement | null = null

  onMount(() => {
    scrollList = document.getElementById('scroll-list') as HTMLDivElement
  })

  createEffect(on(currentTimelineData, (v) => {
    if (scrollList) {
      scrollList.scrollTop = 0
    }
  }, { defer: true }));

  return (
    <div id="scroll-list" class="flex flex-col h-full overflow-y-auto">
      <Show when={currentTimelineData()}>
        <For each={Array.from(currentTimelineData()!.values())}>
          {(line) => (
            <div
              class="relative flex items-start gap-2 px-6 py-2 border-b border-base hv-base"
              onClick={() => { triggerAction({ type: 'set_time', payload: line.startTime}) }}
            >
              <div
                class={clsx([
                  'absolute inset-0',
                  currentLyricLine()?.startTime === line.startTime ? 'anim-bar' : ''
                ])}
                style={{ 'animation-duration': `${line.duration}s` }}
              />
              <div class={clsx([
                'text-xs font-mono mt-1',
                currentLyricLine()?.startTime === line.startTime ? 'font-bold fg-primary op-70' : 'op-30',
              ])}>
                {parseTime(line.startTime)}
              </div>
              <div class={clsx([
                'flex-1',
                line.data.isHighlight ? 'fg-primary' : '',
                currentLyricLine()?.startTime === line.startTime ? 'font-bold' : ''
              ])}>
                {line.data.text}
              </div>
            </div>
          )}
        </For>
      </Show>
    </div>
  )
}