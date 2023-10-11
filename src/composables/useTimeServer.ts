import { $currentTime, $isTimerRunning } from '@/stores/coreState'

export const useTimeServer = () => {
  let interval: NodeJS.Timer | 0

  const start = () => {
    if ($isTimerRunning.get()) return
    interval = setInterval(() => {
      $currentTime.set($currentTime.get() + 1)
    }, 1000)
    $isTimerRunning.set(true)
  }
  const pause = () => {
    if (!$isTimerRunning.get()) return
    clearInterval(interval)
    interval = 0
    $isTimerRunning.set(false)
  }
  const clear = () => {
    pause()
    $currentTime.set(0)
  }
  const restoreStste = (state: { currentTime: number; isTimerRunning: boolean }) => {
    $currentTime.set(state.currentTime)
    if (state.isTimerRunning) {
      start()
    } else {
      pause()
    }
  }

  return {
    $currentTime,
    $isTimerRunning,
    start,
    pause,
    clear,
    restoreStste,
  }
}

export const $timeServer = useTimeServer()