interface Props {
  class?: string
  icon: string
  onClick?: () => void
}

export default (props: Props) => {
  return (
    <div class={`button-icon shrink-0 ${props.class || ''}`} onClick={props.onClick}>
      <div class={props.icon} />
    </div>
  )
}