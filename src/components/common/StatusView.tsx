import { useStore } from '@nanostores/solid'
import { $connectStatus } from '@/stores/connect'
import { $statusText } from '@/stores/ui'

export default () => {
  const connectStatus = useStore($connectStatus)
  const statusText = useStore($statusText)
  let noticeTextDom: HTMLDivElement

  $statusText.listen((v) => {
    noticeTextDom.classList.remove('anim-text-out')
    setTimeout(() => {
      noticeTextDom.classList.add('anim-text-out')
    }, 2000)
  })

  const statusDotClass = () =>({
    'not-ready': 'bg-gray/40',
    ready: 'bg-gray',
    connecting: 'bg-yellow-500',
    connected: 'bg-green-700',
    error: 'bg-red',
  }[connectStatus()])

  return (
    <div class="flex items-center gap-1.5 px-1">
      <div class={`h-2 w-2 rounded-full ${statusDotClass()}`} />
      <div class="text-sm fg-lighter" ref={noticeTextDom!}>{statusText()}</div>
    </div>
  )
}
