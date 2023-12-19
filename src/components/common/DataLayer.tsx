import { onMount } from 'solid-js'
import { loadStorageData, fetchAndUpdateData } from '@/logic/data'
import { $dataset } from '@/stores/coreState'

export default () => {
  const fetchedDatasets = [] as string[]
  onMount(() => {
    $dataset.subscribe(async (dataset) => {
      await loadStorageData(dataset)
      if (!fetchedDatasets.includes(dataset)) {
        await fetchAndUpdateData(dataset) && fetchedDatasets.push(dataset)
      }
    })
  })
}
