import Logo from '@/components/common/Logo'
import AllSongList from '@/components/common/AllSongList'
import FloatControlBarStatusBar from '@/components/screen/FloatControlBarStatusBar'

export default () => {
  return (
    <div class="flex flex-col w-70vw max-w-300px h-60vh overflow-hidden">
      <header class="px-4 py-2 border-b border-base">
        <Logo />
      </header>
      <div class="flex-1 overflow-y-scroll">
        <AllSongList class="p-2 text-sm" />
      </div>
      <footer>
        <FloatControlBarStatusBar />
      </footer>
    </div>
  )
}