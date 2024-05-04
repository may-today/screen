import { Show } from 'solid-js'
import type { ExtraView } from '@/types'

interface Props {
  view: ExtraView
}

export default (props: Props) => {
  return (
    <>
      <Show when={props.view?.type === 'text'}>
        <p class="h-full text-[190px] text-[24vmin] leading-tight text-center font-bold">{props.view!.data}</p>
      </Show>
      <Show when={props.view?.type === 'image'}>
        <div class="absolute inset-0 fcc">
          <img class="w-auto h-auto h-full max-w-screen max-h-screen" src={props.view!.data} alt="img" />
        </div>
      </Show>
    </>
  )
}