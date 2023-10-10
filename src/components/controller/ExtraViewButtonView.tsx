import { createSignal } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { Keyboard, X } from 'lucide-solid'
import { Portal } from 'solid-js/web'
import { Dialog, DialogBackdrop, DialogCloseTrigger, DialogContainer, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@ark-ui/solid'
import { $extraView } from '@/stores/coreState'
import ToggleButton from '@/components/common/ToggleButton'
import Button from '@/components/common/Button'
import { $coreState } from '@/composables'
import type { ExtraView } from '@/types'

export default () => {
  let textarea: HTMLTextAreaElement
  const extraView = useStore($extraView)
  const [showDialog, setShowDialog] = createSignal(false)
  const extraText = () => extraView()?.type === 'text' ? extraView()?.data : ''

  const handleSetExtraView = () => {
    if (!textarea.value) {
      handleClearExtraView()
      return
    }
    const extraView: ExtraView = {
      type: 'text',
      data: textarea.value
    }
    $coreState.triggerAction({ type: 'set_extra', payload: extraView })
    setShowDialog(false)
  }

  const handleClearExtraView = () => {
    textarea.value = ''
    $coreState.triggerAction({ type: 'set_extra', payload: null })
    setShowDialog(false)
  }

  return (
    <Dialog open={showDialog()} onOpen={() => setShowDialog(true)} onClose={() => setShowDialog(false)}>
      <DialogTrigger class="w-full h-full bg-transparent">
        <ToggleButton toggle={!!extraView()} class="w-full h-full">
          <Keyboard size={16} />
          <span>图片/文字</span>
        </ToggleButton>
      </DialogTrigger>
      <Portal>
        <DialogBackdrop />
        <DialogContainer>
          <DialogContent class="relative">
            <div class="flex flex-col space-y-1.5 p-6 pb-3">
              <DialogTitle>发送图片/文字</DialogTitle>
              <DialogDescription>投射到屏幕(目前仅支持文字)</DialogDescription>
            </div>
            <div class="p-6 pt-3">
              <textarea
                ref={textarea!}
                value={extraText()}
                class="flex min-h-[60px] w-full rounded-md border border-base bg-transparent px-3 py-2 text-sm shadow-sm ring-light/50 placeholder:fg-lighter-200 focus-visible:outline-none focus-visible:ring-1"
                placeholder="要发送的文字内容"
              />
              <div class="mt-3 flex gap-2">
                <Button class="flex-[1]" variant="outline" onClick={handleClearExtraView}>清空</Button>
                <Button class="flex-[2]" onClick={handleSetExtraView}>发送</Button>
              </div>
            </div>
            <DialogCloseTrigger class="absolute top-2 right-2 fcc w-8 h-8 bg-transparent">
              <X size={20} />
            </DialogCloseTrigger>
          </DialogContent>
        </DialogContainer>
      </Portal>
    </Dialog>
  )
}
