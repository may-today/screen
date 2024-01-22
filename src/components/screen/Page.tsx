import { Switch, Match } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { $coreState } from '@/composables'
import { $currentSongData } from '@/stores/data'
import { $extraView, $blackScreen } from '@/stores/coreState'
import { Motion, Presence } from '@motionone/solid'
import SongCoverScreenView from './SongCoverScreenView'
import LyricScreenView from './LyricScreenView'
import ExtraViewScreenView from './ExtraViewScreenView'

export default () => {
  const currentSongData = useStore($currentSongData)
  const currentLyricLine = $coreState.currentLyricLine
  const extraView = useStore($extraView)
  const blackScreen = useStore($blackScreen)

  return (
    <div class="w-screen h-[100svh] p-[6vmin] text-[30vmin] overflow-hidden">
      <Presence exitBeforeEnter>
        <Switch>
          <Match when={blackScreen()}>
          </Match>
          <Match when={extraView()}>
            <Motion class="fcc h-full w-full" animate={{ opacity: [0, 1] }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
              <ExtraViewScreenView view={extraView()} />
            </Motion>
          </Match>
          <Match when={currentLyricLine()}>
            <LyricScreenView lyric={currentLyricLine()!.data} />
          </Match>
          <Match when={currentSongData()}>
            <Motion animate={{ opacity: [0, 1] }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
              <SongCoverScreenView detail={currentSongData()!} />
            </Motion>
          </Match>
        </Switch>
      </Presence>
    </div>
  )
}