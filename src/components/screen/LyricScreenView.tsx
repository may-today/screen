import { Motion } from 'solid-motionone'
import { Rerun } from '@solid-primitives/keyed'
import type { LyricLine } from '@/types'

interface Props {
  lyric: LyricLine
  nextLyric?: LyricLine
}

export default (props: Props) => {
  return (
    <Rerun on={props.lyric}>
      <Motion
        initial={{ opacity: 0.4, x: 10 }}
        animate={{ opacity: 1, x: 0, transition: { delay: 0.05 } }}
        transition={{ duration: 0.1 }}
        exit={{ opacity: 0.4, x: -10 }}
      >
        <p class="text-[190px] text-[24vmin] leading-tight text-center font-bold">{props.lyric.text}</p>
      </Motion>
    </Rerun>
  )
}