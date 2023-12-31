export const parseTime = (time: number) => {
  if (time < 0) {
    return ''
  }
  const minutes = Math.floor(time / 60)
  const seconds = time % 60
  const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`
  const secondsStr = seconds < 10 ? `0${seconds}` : `${seconds}`
  return `${minutesStr}:${secondsStr}`
}