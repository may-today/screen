interface Props {
  class?: string
  icon: string
  onClick?: () => void
}

export default (props: Props) => {
  return (
    <div class={`button-icon ${props.class || ''}`} onClick={props.onClick}>
      <div class={props.icon} />
    </div>
  )
}