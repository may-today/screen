import { onMount } from 'solid-js'
import { loadStorageData } from '@/stores/data'

export default () => {
  onMount(async () => {
    loadStorageData()
  })
}
