import { Switch, Match } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { $mainState } from '@/composables'
import { $currentSongData } from '@/stores/data'
import { $extraView, $blackScreen } from '@/stores/mainState'
import SongCoverScreenView from './SongCoverScreenView'
import LyricScreenView from './LyricScreenView'
import ExtraViewScreenView from './ExtraViewScreenView'

export default () => {
  const currentSongData = useStore($currentSongData)
  const currentLyricLine = $mainState.currentLyricLine
  const extraView = useStore($extraView)
  const blackScreen = useStore($blackScreen)

  return (
    <div class="w-screen h-[100svh] p-6 text-[30vmin]">
      <Switch>
        <Match when={blackScreen()}>
        </Match>
        <Match when={extraView()}>
          <ExtraViewScreenView view={extraView()} />
        </Match>
        <Match when={currentLyricLine()}>
          <LyricScreenView lyric={currentLyricLine()!.data} />
        </Match>
        <Match when={currentSongData()}>
          <SongCoverScreenView detail={currentSongData()!} />
        </Match>
      </Switch>
    </div>
  )
}