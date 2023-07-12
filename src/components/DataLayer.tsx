import { onMount } from 'solid-js'
import { saveAndParseDetailList } from '@/stores/data'
import type { SongDetail } from '@/types'

export default () => {
  onMount(async () => {
    const allSongData: SongDetail[] = await (await fetch('https://mayday.blue/api/v1/detail-list')).json()
    saveAndParseDetailList(allSongData)
  })
}
