import { Show, createSignal } from 'solid-js'
import { Portal } from 'solid-js/web'
import { Dialog, DialogBackdrop, DialogCloseTrigger, DialogContainer, DialogContent, DialogDescription, DialogTitle } from '@ark-ui/solid'
import { X } from 'lucide-solid'

export default () => {
  const [showDialog, setShowDialog] = createSignal(false)

  return (
    <>
      <div class="text-sm" onClick={() => setShowDialog(true)}>Mayday <span class="fg-primary">Screen</span></div>
      <Dialog open={showDialog()} onClose={() => setShowDialog(false)} closeOnEsc={false} closeOnOutsideClick={false} trapFocus={false}>
        <Portal>
          <DialogBackdrop />
          <DialogContainer>
            <DialogContent class="relative">
              <div class="flex flex-col space-y-1.5 p-6 pb-3">
                <DialogTitle>Mayday Screen</DialogTitle>
                <DialogDescription>五月天云端提词器</DialogDescription>
              </div>
              <div class="p-6 pt-3">
                <p class="text-sm leading-relaxed fg-lighter">本工具为非官方软件，与相信音乐并无关联。</p>
                <p class="text-sm leading-relaxed fg-lighter">歌词由 <a class="fg-base" href="https://ddiu.io">Diu</a> 于 <a class="fg-base" href="https://mayday.blue">mayday.blue</a> 整理</p>
                <p class="text-sm leading-relaxed fg-lighter">源代码: <a class="fg-base" href="https://github.com/may-today/screen">may-today/screen</a></p>
              </div>
              <DialogCloseTrigger class="absolute top-2 right-2 fcc w-8 h-8 bg-transparent">
                <X size={20} />
              </DialogCloseTrigger>
            </DialogContent>
          </DialogContainer>
        </Portal>
      </Dialog>
    </>
  )
}