import { Portal } from 'solid-js/web'
import { MenuIcon } from 'lucide-solid'
import { Popover } from '@ark-ui/solid'
import Button from '@/components/common/Button'
import FloatControllerMenuPanel from './FloatControllerMenuPanel'

export default () => {
  return (
    <Popover.Root modal>
      <Popover.Trigger>
        <Button size="large" variant="outline">
          <MenuIcon class="op-25" />
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content class="bottom-in bg-blur">
            <FloatControllerMenuPanel />
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  )
}
