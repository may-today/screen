import { Show } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { $coreState } from '@/composables'
import { $currentSongData } from '@/stores/data'

export default () => {
  const currentSongData = useStore($currentSongData)

  return (
    <Show when={currentSongData()}>
      <div
        class="absolute left-0 w-30vw top-20 bottom-20 z-10"
        onClick={() => $coreState.triggerAction({ type: 'show_prev_next_line', payload: 'prev' })}
      />
      <div
        class="absolute right-0 w-30vw top-20 bottom-20 z-10"
        onClick={() => $coreState.triggerAction({ type: 'show_prev_next_line', payload: 'next' })}
      />
    </Show>
  )
}