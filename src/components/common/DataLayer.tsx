import { onMount } from 'solid-js'
import { loadStorageData, fetchAndUpdateData } from '@/stores/data'

export default () => {
  onMount(async () => {
    loadStorageData()
    await fetchAndUpdateData()
  })
}
