import { For, Show } from 'solid-js'
import { useStore } from '@nanostores/solid'
import clsx from 'clsx'
import { $coreState } from '@/composables'
import { $currentTimelineData } from '@/stores/data'
import { $currentLyricIndex } from '@/stores/coreState'
import { parseTime } from '@/logic/time'

export default () => {
  const { triggerAction } = $coreState
  const currentTimelineData = useStore($currentTimelineData)
  const currentLyricIndex = useStore($currentLyricIndex)

  let scrollDiv: HTMLDivElement

  $currentTimelineData.listen(() => {
    setTimeout(() => {
      scrollDiv.scrollTop = 0
    }, 0)
  })

  return (
    <div ref={scrollDiv!} class="flex-1 flex flex-col h-full overflow-y-auto">
      <For each={currentTimelineData()}>
        {(line, index) => (
          <div
            class={
              clsx([
                'relative flex shrink-0 items-start gap-2 px-6 py-2 border-b border-base cursor-pointer',
                currentLyricIndex() === index() ? 'bg-primary hover:bg-primary' : 'hv-base'
              ])
            }
            onClick={() => { triggerAction({ type: 'set_lyric_index', payload: index() }) }}
          >
            <Show when={line.startTime >= 0}>
              <div class={clsx([
                'text-xs font-mono mt-1',
                currentLyricIndex() === index() ? 'font-bold fg-primary op-70' : 'op-30',
              ])}>
                {parseTime(line.startTime)}
              </div>
            </Show>
            <div class={clsx([
              'flex-1',
              line.data.isHighlight ? 'fg-primary' : '',
              currentLyricIndex() === index() ? 'font-bold' : ''
            ])}>
              {line.data.text}
            </div>
          </div>
        )}
      </For>
    </div>
  )
}