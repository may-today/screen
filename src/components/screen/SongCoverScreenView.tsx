import { Show } from 'solid-js'
import type { SongDetail } from '@/types'

interface Props {
  detail: SongDetail
}

export default (props: Props) => {
  return (
    <div>
      <Show when={props.detail.meta?.year}>
        <p class="text-[120px] text-[16vmin] leading-tight mx-4">{props.detail.meta.year}</p>
      </Show>
      <p class="text-[220px] text-[28vmin] leading-tight font-bold">{props.detail.title}</p>
    </div>
  )
}