import { $currentTime, $isTimerRunning } from '@/stores/coreState'

export const useTimeServer = () => {
  let interval: NodeJS.Timer | 0
  let worker: Worker | null = null;

  const init = () => {
    if (window.Worker) {
      const wk = new Worker(new URL('@/worker.ts', import.meta.url), { type: 'module' });

      wk.onmessage = (event) => {
        if (event.data === 'interval') {
          $currentTime.set($currentTime.get() + 1)
        }
      };
  
      wk.onerror = (error) => {
        worker = null;
        console.error('Worker error:', error);
      };

    }
  }

  const start = () => {
    if ($isTimerRunning.get()) return
    if (worker) {
      worker.postMessage({ command: 'interval:start'})
    } else {
      interval = setInterval(() => {
        $currentTime.set($currentTime.get() + 1)
      }, 100)
    }
    $isTimerRunning.set(true)
  }
  const pause = () => {
    if (!$isTimerRunning.get()) return
    if (worker) {
      worker.postMessage({ command: 'interval:stop'})
    } else {
      clearInterval(interval)
      interval = 0
    }
    $isTimerRunning.set(false)
  }
  const clear = () => {
    pause()
    $currentTime.set(0)
  }
  const restoreState = (state: { currentTime: number; isTimerRunning: boolean }) => {
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
    restoreState,
    init,
  }
}

export const $timeServer = useTimeServer()