import { Portal } from 'solid-js/web'
import { Menu as MenuIcon } from 'lucide-solid'
import { Popover, PopoverContent, PopoverPositioner, PopoverTrigger } from '@ark-ui/solid'
import Button from '@/components/common/Button'
import FloatControllerMenuPanel from './FloatControllerMenuPanel'

export default () => {
  return (
    <Popover>
      <PopoverTrigger>
        <Button size="large" variant="outline">
          <MenuIcon />
        </Button>
      </PopoverTrigger>
      <Portal>
        <PopoverPositioner>
          <PopoverContent>
            <FloatControllerMenuPanel />
          </PopoverContent>
        </PopoverPositioner>
      </Portal>
    </Popover>
  )
}
