import type { LyricLine } from '@/types'

interface Props {
  lyric: LyricLine
}

export default (props: Props) => {
  return (
    <p class="text-[190px] text-[24vmin] leading-tight text-center font-bold">{props.lyric.text}</p>
  )
}