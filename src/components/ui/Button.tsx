interface Props {
  icon: string
  onClick?: () => void
}

export default (props: Props) => {
  return (
    <div class="button-icon" onClick={props.onClick}>
      <div class={props.icon} />
    </div>
  )
}