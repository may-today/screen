import { Show } from 'solid-js'
import { Heart, HeartPlus } from 'lucide-solid'
import { useStore } from '@nanostores/solid'
import { addFav, $favIdList, removeFav } from '@/stores/favList'
import { $currentSongData } from '@/stores/data'

interface Props {}

export default (props: Props) => {
  const favIdList = useStore($favIdList)
  const currentSongData = useStore($currentSongData)

  return (
    <Show when={currentSongData()}>
      <Show
        when={favIdList().includes(currentSongData()?.slug || '')}
        fallback={
          <div class="fcc border-l border-base px-4 hv-base" onClick={() => addFav($currentSongData.get()!)}>
            <HeartPlus size={20} />
          </div>
        }
      >
        <div class="fcc border-l border-base px-4 hv-base" onClick={() => removeFav(currentSongData()?.slug || '')}>
          <Heart fill="currentColor" size={20} />
        </div>
      </Show>
    </Show>
  )
}
