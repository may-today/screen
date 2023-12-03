import { onMount } from 'solid-js'
import { loadStorageData, fetchAndUpdateData } from '@/logic/data'

export default () => {
  onMount(async () => {
    await loadStorageData()
    // await fetchAndUpdateData()
  })
}
