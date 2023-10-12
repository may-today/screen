import { createSignal, Show } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { Keyboard, X, HardDriveUpload } from 'lucide-solid'
import { Portal } from 'solid-js/web'
import { createFileUploader } from '@solid-primitives/upload'
import { Dialog, DialogBackdrop, DialogCloseTrigger, DialogContainer, DialogContent, DialogTitle, DialogTrigger } from '@ark-ui/solid'
import { Tabs } from '@ark-ui/solid'
import { $extraView } from '@/stores/coreState'
import ToggleButton from '@/components/common/ToggleButton'
import Button from '@/components/common/Button'
import { $coreState } from '@/composables'
import type { ExtraView } from '@/types'

const toBase64 = (file: File): Promise<string | ArrayBuffer | null> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
})

export default () => {
  const extraView = useStore($extraView)
  const [showDialog, setShowDialog] = createSignal(false)
  const [currentTab, setCurrentTab] = createSignal('text')
  const [tempText, setTempText] = createSignal('')
  const [tempFileSource, setTempFileSource] = createSignal('')
  const { files, selectFiles } = createFileUploader({ accept: 'image/*' })
  const extraText = () => extraView()?.type === 'text' ? extraView()?.data : ''
  const extraImgUrl = () => extraView()?.type === 'image' ? extraView()?.data : ''

  const handleSetExtraView = async () => {
    if (currentTab() === 'text') {
      setTempFileSource('')
      if (!tempText()) {
        handleClearExtraView()
        return
      }
      const extraView: ExtraView = {
        type: 'text',
        data: tempText()
      }
      $coreState.triggerAction({ type: 'set_extra', payload: extraView })
    } else if (currentTab() === 'image') {
      const selectedFile = files()?.[0] || null
      if (!selectedFile) {
        handleClearExtraView()
        return
      }
      try {
        const base64 = await toBase64(selectedFile.file)   
        if (typeof base64 !== 'string') {
          handleClearExtraView()
          return
        }   
        const extraView: ExtraView = {
          type: 'image',
          data: base64,
        }
        $coreState.triggerAction({ type: 'set_extra', payload: extraView }) 
      } catch (error) {
        handleClearExtraView()
      }
    }
    setShowDialog(false)
  }

  const handleClearExtraView = () => {
    $coreState.triggerAction({ type: 'set_extra', payload: null })
    handleDialogClose()
  }

  const handleClickUpload = async () => {
    selectFiles(([file]) => {
      setTempFileSource(file.source)
    })
  }

  const handleDialogOpen = () => {
    setCurrentTab(extraView()?.type || 'text')
    setTempText(extraText() || '')
    setTempFileSource(extraImgUrl() || '')
    setShowDialog(true)
  }

  const handleDialogClose = () => {
    setTempText('')
    setTempFileSource('')
    setShowDialog(false)
  }

  return (
    <Dialog open={showDialog()} onOpen={handleDialogOpen} onClose={handleDialogClose}>
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
            </div>
            <div class="px-6 pb-6">
              <Tabs.Root
                value={currentTab()}
                onChange={(e) => setCurrentTab(e.value!)}
              >
                <header class="flex items-center py-2">
                  <Tabs.List>
                    <Tabs.Trigger value="text">文字</Tabs.Trigger>
                    <Tabs.Trigger value="image">图片</Tabs.Trigger>
                  </Tabs.List>
                </header>
                <div>
                  <Tabs.Content value="text">
                    <textarea
                      value={tempText()}
                      onChange={(e) => setTempText(e.target.value) }
                      class="flex min-h-18 w-full rounded-md border border-base bg-transparent px-3 py-2 text-sm shadow-sm ring-light/50 placeholder:fg-lighter-200 focus-visible:outline-none focus-visible:ring-1"
                      placeholder="要发送的文字内容"
                    />
                  </Tabs.Content>
                  <Tabs.Content value="image">
                    <div class="fcc gap-1 p-4 aspect-video border border-base rounded-md" onClick={handleClickUpload}>
                      <Show when={tempFileSource()} fallback={(
                        <>
                          <HardDriveUpload size={20} strokeWidth={1.5} class="op-50" />
                          <span class="op-50 text-sm">从相册选择</span>
                        </>
                      )}>
                        <img class="max-w-full max-h-full" src={tempFileSource()} alt="img-preview" />
                      </Show>
                    </div>
                  </Tabs.Content>
                </div>
              </Tabs.Root>
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
