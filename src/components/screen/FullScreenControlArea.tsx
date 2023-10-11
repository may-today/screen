import { $coreState } from '@/composables'

export default () => {
  return (
    <>
      <div
        class="absolute left-0 w-30vw top-20 bottom-20 z-10"
        onClick={() => $coreState.triggerAction({ type: 'show_prev_next_line', payload: 'prev' })}
      />
      <div
        class="absolute right-0 w-30vw top-20 bottom-20 z-10"
        onClick={() => $coreState.triggerAction({ type: 'show_prev_next_line', payload: 'next' })}
      />
    </>
  )
}