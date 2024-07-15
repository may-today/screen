import { Show } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { $currentSongData } from '@/stores/data'
import { $sidebarOpen } from '@/stores/ui'
import { $coreState } from '@/composables'
import { X, EyeOff, Bluetooth, BluetoothIcon, BluetoothConnected, BluetoothOff } from 'lucide-solid'
import { $blackScreen, $stickDevices } from '@/stores/coreState'
import Button from '@/components/common/Button'
import ToggleButton from '@/components/common/ToggleButton'
import ExtraViewButtonView from '@/components/controller/ExtraViewButtonView'
import { checkWebBluetoothAvailability } from '@/logic/bluetoothStick'

export default () => {
  const currentSongData = useStore($currentSongData)
  const blackScreen = useStore($blackScreen)
  const devices = useStore($stickDevices)

  const handleToggleBlackScreen = () => {
    $coreState.triggerAction({ type: 'set_screen_off', payload: !blackScreen() })
  }

  return (
    <div class="flex items-stretch justify-between h-12 border-t border-base overflow-hidden">
      <div class="flex-1 flex items-center gap-2 pl-4 pr-3 border-r border-base" data-device={JSON.stringify(devices())}>
        <h3
          class="flex items-center gap-1 cursor-pointer"
          onClick={() => $sidebarOpen.set(true)}
        >
          <Show
            when={currentSongData()}
            fallback={<div class="text-sm op-50">当前无歌曲</div>}
          >
            <span class="text-sm line-clamp-2 op-50">
              {currentSongData()!.title}
              {currentSongData()!.meta?.artist
                ? ` - ${currentSongData()!.meta.artist}`
                : ""}
            </span>
          </Show>
        </h3>
        <Show when={currentSongData()}>
          <Button
            size="small"
            variant="outline"
            class="pr-2"
            onClick={() =>
              $coreState.triggerAction({ type: "set_id", payload: null })
            }
          >
            <X size={16} strokeWidth={1} />
            <span>清除</span>
          </Button>
        </Show>
      </div>
      <ExtraViewButtonView type="simple" class="border-r border-base" />
      <ToggleButton toggle={blackScreen()} onClick={handleToggleBlackScreen}>
        <EyeOff size={16} />
      </ToggleButton>
      {/* TODO add Tooltips */}
      <ToggleButton
        disabled={!checkWebBluetoothAvailability()}
        toggle={devices().length !== 0}
        onClick={() => {
          $coreState.requestStick();
        }}
      >
        <Bluetooth size={16} />
      </ToggleButton>
    </div>
  );
};
