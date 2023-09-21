import { Show } from 'solid-js'
import type { ExtraView } from '@/types'

interface Props {
  view: ExtraView
}

export default (props: Props) => {
  return (
    <Show when={props.view?.type === 'text'}>
      <p class="text-[190px] text-[24vmin] leading-tight text-center font-bold">{props.view!.data}</p>
    </Show>
  )
}