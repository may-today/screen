import { map } from 'nanostores'
import type { SongMeta, SongGroup } from '@/types'

export const $allData = map<Record<string, SongMeta>>({})
export const $groupData = map<SongGroup[]>([])

export const getDataById = (id: string | null) => {
  if (!id) return null
  return $allData.get()[id]
}
