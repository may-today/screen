import { getDataById } from '@/stores/data'

export default () => {
  const id = 'cang-jie'
  const data = getDataById(id)
  console.log(data)

  return (
    <div class="p-6 text-[168px]">
      1
    </div>
  )
}