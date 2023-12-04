import type { JSXElement } from "solid-js"

interface Props {
  class?: string
  toggle: boolean
  disabled?: boolean
  onClick?: () => void
  children?: JSXElement
}

export default (props: Props) => {
  const toggleClass = () => {
    let baseClass = ''
    if (props.toggle) {
      baseClass += 'bg-white text-black transition-colors duration-300'
      if (!props.disabled) {
        baseClass += ' hover:bg-light-600 cursor-pointer'
      }
    } else {
      if (!props.disabled) {
        baseClass += 'hv-base'
      }
    }
    return baseClass
  }

  const disabledClass = () => {
    if (props.disabled) {
      return 'op-50 cursor-not-allowed'
    } else {
      return ''
    }
  }

  return (
    <div class={`flex items-center gap-1 px-4 text-sm shrink-0 ${toggleClass()} ${disabledClass()} ${props.class || ''}`} onClick={props.onClick}>
      { props.children }
    </div>
  )
}