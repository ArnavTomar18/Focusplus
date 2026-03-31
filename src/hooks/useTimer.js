import { useState, useRef, useCallback, useEffect } from 'react'

export function useTimer(defaultSeconds = 120) {
  const [seconds, setSeconds] = useState(defaultSeconds)
  const [totalSeconds, setTotalSeconds] = useState(defaultSeconds)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)
  const onCompleteRef = useRef(null)

  const start = useCallback(() => {
    if (running) return
    setRunning(true)
    intervalRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setRunning(false)
          onCompleteRef.current?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [running])

  const pause = useCallback(() => {
    clearInterval(intervalRef.current)
    setRunning(false)
  }, [])

  const reset = useCallback(() => {
    clearInterval(intervalRef.current)
    setRunning(false)
    setSeconds(totalSeconds)
  }, [totalSeconds])

  const setDuration = useCallback((secs) => {
    clearInterval(intervalRef.current)
    setRunning(false)
    setTotalSeconds(secs)
    setSeconds(secs)
  }, [])

  const setOnComplete = useCallback((fn) => { onCompleteRef.current = fn }, [])

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const display = () => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  }

  return { seconds, totalSeconds, running, start, pause, reset, setDuration, display, setOnComplete }
}
