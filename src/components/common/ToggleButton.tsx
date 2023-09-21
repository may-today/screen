import type { JSXElement } from "solid-js"

interface Props {
  class?: string
  toggle: boolean
  onClick?: () => void
  children?: JSXElement
}

export default (props: Props) => {
  const toggleClass = () => {
    if (props.toggle) {
      return 'bg-white text-black hover:bg-light-600 cursor-pointer transition-colors duration-300'
    } else {
      return 'hv-base'
    }
  }

  return (
    <div class={`flex items-center gap-1 px-4 text-sm shrink-0 ${toggleClass()} ${props.class || ''}`} onClick={props.onClick}>
      { props.children }
    </div>
  )
}