import { useStore } from '@nanostores/solid'
import { EyeOff } from 'lucide-solid'
import { $blackScreen } from '@/stores/mainState'
import { parseTime } from '@/logic/time'
import { $timeServer, $mainState } from '@/composables'
import ToggleButton from '@/components/common/ToggleButton'

export default () => {
  const currentTime = useStore($timeServer.$currentTime)
  const blackScreen = useStore($blackScreen)

  const handleToggleBlackScreen = () => {
    $mainState.handleAction({ type: 'set_screen_off', payload: !blackScreen() })
  }

  return (
    <div class="flex items-stretch h-full">
      <div
        class="flex-1 flex items-center gap-1 px-4 border-r border-base hv-base select-none"
        onClick={handleToggleBlackScreen}
      >
        <div class="text-sm font-mono">{parseTime(currentTime())}</div>
      </div>
      <ToggleButton toggle={blackScreen()} onClick={handleToggleBlackScreen}>
        <EyeOff size={16} />
        <span>关屏</span>
      </ToggleButton>
    </div>
  )
}
