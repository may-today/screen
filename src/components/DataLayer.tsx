import { onMount } from 'solid-js'
import { $allData, $groupData } from '@/stores/data'

export default () => {
  onMount(async () => {
    const allSongData = await (await fetch('https://mayday.blue/api/detail/dict')).json()
    $allData.set(allSongData)
    const groupData = await (await fetch('https://mayday.blue/api/list')).json()
    $groupData.set(groupData)
  })
}
