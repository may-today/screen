import { createSignal } from 'solid-js'

export const useTimeServer = () => {
  const [time, setTime] = createSignal(0)
  const [isRunning, setIsRunning] = createSignal(false)
  let interval: NodeJS.Timer | 0

  const start = () => {
    if (isRunning()) return
    interval = setInterval(() => {
      setTime(time() + 1)
    }, 1000)
    setIsRunning(true)
  }
  const pause = () => {
    if (!isRunning()) return
    clearInterval(interval)
    interval = 0
    setIsRunning(false)
  }
  const startOrPause = () => {
    if (isRunning()) {
      pause()
    } else {
      start()
    }
  }
  const clear = () => {
    pause()
    setTime(0)
  }

  return [
    time,
    setTime,
    {
      isRunning,
      start,
      pause,
      startOrPause,
      clear,
    }
  ] as const
}