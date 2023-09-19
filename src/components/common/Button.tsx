interface Props {
  class?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  icon: string
  onClick?: () => void
}

export default (props: Props) => {
  const variantClass = () => {
    return {
      primary: 'fcc rounded-md w-8 h-8 shrink-0 bg-white text-black hover:bg-light cursor-pointer',
      secondary: 'fcc rounded-md w-8 h-8 shrink-0 bg-base-100 hover:bg-base-100 cursor-pointer',
      outline: 'fcc rounded-md w-8 h-8 shrink-0 bg-transparent border border-base hover:bg-base-100 cursor-pointer',
      ghost: '',
    }[props.variant || 'primary']
  }

  return (
    <div class={`${variantClass()} ${props.class || ''}`} onClick={props.onClick}>
      <div class={props.icon} />
    </div>
  )
}