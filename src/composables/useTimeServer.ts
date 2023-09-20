export const useTimeServer = () => {
  let currentTime = 0
  let isRunning = false
  let interval: NodeJS.Timer | 0
  let onUpdate: ((time: number) => void) | null = null

  const setCurrentTime = (time: number) => {
    currentTime = time
    if (onUpdate) onUpdate(currentTime)
  }
  const start = () => {
    if (isRunning) return
    interval = setInterval(() => {
      currentTime++
      if (onUpdate) onUpdate(currentTime)
    }, 1000)
    isRunning = true
  }
  const pause = () => {
    if (!isRunning) return
    clearInterval(interval)
    interval = 0
    isRunning = false
  }
  const clear = () => {
    pause()
    currentTime = 0
  }
  const setOnUpdate = (callback: ((time: number) => void) | null) => {
    onUpdate = callback
  }

  return {
    currentTime,
    setCurrentTime,
    isRunning,
    start,
    pause,
    clear,
    setOnUpdate,
  }
}

export const $timeServer = useTimeServer()