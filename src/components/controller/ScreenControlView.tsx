import { useStore } from '@nanostores/solid'
import { EyeOff } from 'lucide-solid'
import { $blackScreen } from '@/stores/mainState'
import { $mainState } from '@/composables'
import ToggleButton from '@/components/common/ToggleButton'
import ExtraViewButtonView from './ExtraViewButtonView'
// import TextControlView from './TextControlView'

export default () => {
  const blackScreen = useStore($blackScreen)

  const handleToggleBlackScreen = () => {
    $mainState.handleAction({ type: 'set_screen_off', payload: !blackScreen() })
  }

  return (
    <div class="flex items-stretch h-full">
      <div class="flex-1 h-full border-r border-base">
        <ExtraViewButtonView />
      </div>
      <ToggleButton toggle={blackScreen()} onClick={handleToggleBlackScreen}>
        <EyeOff size={16} />
        <span>关屏</span>
      </ToggleButton>
    </div>
  )
}
