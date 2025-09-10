import { createSignal } from 'solid-js'
import Button from '@/components/common/Button'
import clsx from 'clsx'
import { $coreState } from '@/composables'
import { parseRawLRCFile } from '@/logic/lyric'
import { $sidebarOpen } from '@/stores/ui'
import type { SongDetail } from '@/types'

export default () => {
  let inputRef: HTMLInputElement
  let textareaRef: HTMLTextAreaElement
  const [titleText, setTitleText] = createSignal<string>('')
  const [contentText, setContentText] = createSignal<string>('')

  const handleClear = () => {
    inputRef.value = ''
    textareaRef.value = ''
    setTitleText('')
    setContentText('')
  }

  const handlePushLyric = () => {
    const rawContent = contentText().trim()
    if (!rawContent) return
    const rawSongName = titleText() || '♫'
    const [songTitle, songArtist] = rawSongName.split('-', 2).map((str) => str.trim())
    const singleTrack: SongDetail = {
      title: songTitle,
      slug: `manual:${songTitle}`,
      index: '',
      meta: {
        artist: songArtist,
      },
      detail: parseRawLRCFile(rawContent),
    }
    $coreState.triggerAction({ type: 'set_single_track', payload: singleTrack })
    handleClear()
    $sidebarOpen.set(false)
  }

  return (
    <div class="h-full flex flex-col gap-3 p-4">
      <textarea
        class={clsx([
          'flex-1 w-full rounded-md border border-base bg-transparent px-3 py-2 text-sm shadow-sm',
          'ring-light/50 placeholder:op-50 dark:placeholder:op-30 focus-visible:outline-none focus-visible:ring-1',
          'resize-none',
        ])}
        ref={textareaRef!}
        onChange={(e) => setContentText(e.target.value) }
        placeholder="输入/编辑lrc格式文件\n每句一行"
      />
      <input
        class={clsx([
          'bg-transparent ring-0 h-10 rounded-md border border-base bg-transparent px-3 text-sm shadow-sm',
          'ring-light/50 placeholder:op-50 dark:placeholder:op-30 focus-visible:outline-none focus-visible:ring-1',
        ])}
        type="text"
        ref={inputRef!}
        onInput={(e) => setTitleText(e.target.value)}
        placeholder="输入歌曲名"
        spellcheck={false}
      />
      <div class="flex gap-2">
        <Button class="flex-[1]" variant="outline" onClick={handleClear}>清空</Button>
        <Button class="flex-[2]" variant="secondary" onClick={handlePushLyric}>发送</Button>
      </div>
    </div>
  )
}