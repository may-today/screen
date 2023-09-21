import type { JSXElement } from "solid-js"

interface Props {
  class?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  icon?: string
  onClick?: () => void
  children?: JSXElement
}

export default (props: Props) => {
  const variantClass = () => {
    return {
      primary: 'fcc gap-1 rounded-md shrink-0 bg-white text-black hover:bg-light cursor-pointer',
      secondary: 'fcc gap-1 rounded-md shrink-0 bg-base-100 hover:bg-base-100 cursor-pointer',
      outline: 'fcc gap-1 rounded-md shrink-0 bg-transparent border border-base hover:bg-base-100 cursor-pointer',
      ghost: 'fcc',
    }[props.variant || 'primary']
  }

  const sizeClass = () => {
    return {
      small: props.children ? 'px-1 py-1 text-xs' : 'w-6 h-6 text-xs',
      medium: props.children ? 'p-2 text-sm' : 'w-8 h-8 text-sm',
      large: props.children ? 'p-2 text-md' : 'w-10 h-10 text-md',
    }[props.size || 'medium']
  }

  return (
    <div class={`${sizeClass()} ${variantClass()} ${props.class || ''}`} onClick={props.onClick}>
      { props.icon && <div class={props.icon} /> }
      { props.children }
    </div>
  )
}