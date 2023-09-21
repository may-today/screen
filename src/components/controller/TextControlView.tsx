import { Type } from 'lucide-solid'
import { Portal } from 'solid-js/web'
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuPositioner,
  MenuTrigger,
} from '@ark-ui/solid'

export default () => {
  const handleSelect = ({value}: {value: string}) => {
    console.log(value)
  }

  return (
    <Menu onSelect={handleSelect}>
      <MenuTrigger class="fcc h-full px-4 bg-transparent hv-base select-none">
        <Type size={16} />
      </MenuTrigger>
      <Portal>
        <MenuPositioner>
          <MenuContent>
            <MenuItem id="menu_id">Menu</MenuItem>
          </MenuContent>
        </MenuPositioner>
      </Portal>
    </Menu>
  )
}
