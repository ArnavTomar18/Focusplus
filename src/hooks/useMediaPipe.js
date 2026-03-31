import { useState, useRef, useCallback } from 'react'

export function useMediaPipe() {
  const [status, setStatus] = useState('idle') // idle | starting | active | error
  const [stats, setStats] = useState({ total: 0, focused: 0, distracted: 0, noFace: 0 })
  const [attentionData, setAttentionData] = useState(null)

  const faceDetectionRef = useRef(null)
  const cameraRef = useRef(null)
  const videoStreamRef = useRef(null)
  const attentionHistoryRef = useRef([])
  const isProcessingRef = useRef(false)
  const statsRef = useRef({ total: 0, focused: 0, distracted: 0, noFace: 0, start: null })

  const FOCUS_THRESHOLD = 0.54
  const SMOOTHING_WINDOW = 10
  const CENTER_REGION = { x: 0.2, y: 0.2, width: 0.6, height: 0.6 }

  const updateStats = useCallback((state) => {
    statsRef.current.total++
    if (state === 'focused') statsRef.current.focused++
    else if (state === 'distracted') statsRef.current.distracted++
    else statsRef.current.noFace++
    if (!statsRef.current.start) statsRef.current.start = Date.now()

    setStats({ ...statsRef.current })
  }, [])

  const calculateAttention = useCallback((detection) => {
    const bbox = detection.boundingBox
    const keypoints = detection.keypoints || []
    let yaw = 0, pitch = 0

    if (keypoints.length >= 3) {
      const rightEye = keypoints[0], leftEye = keypoints[1], noseTip = keypoints[2]
      if (rightEye && leftEye && noseTip) {
        const eyeMidX = (rightEye.x + leftEye.x) / 2
        yaw = Math.max(-50, Math.min(50, (noseTip.x - eyeMidX) * 180))
        const eyeMidY = (rightEye.y + leftEye.y) / 2
        pitch = Math.max(-30, Math.min(30, (noseTip.y - eyeMidY) * 120))
      }
    }

    const isLookingStraight = Math.abs(yaw) <= 15 && Math.abs(pitch) <= 10
    let score = isLookingStraight ? 1.0 : 0.1

    if (isLookingStraight) {
      const dist = Math.sqrt(Math.pow(bbox.xCenter - 0.5, 2) + Math.pow(bbox.yCenter - 0.5, 2))
      const maxDist = Math.sqrt(Math.pow(CENTER_REGION.width / 2, 2) + Math.pow(CENTER_REGION.height / 2, 2))
      score = Math.exp(-(dist / maxDist) * 1.5)
      if ((detection.score?.[0] || 0) > 0.8) score *= 1.1
    }

    score = Math.max(0, Math.min(1, score))

    // Smooth
    attentionHistoryRef.current.push(score)
    if (attentionHistoryRef.current.length > SMOOTHING_WINDOW)
      attentionHistoryRef.current.shift()

    const weights = attentionHistoryRef.current.map((_, i) =>
      Math.exp((i - attentionHistoryRef.current.length + 1) / attentionHistoryRef.current.length))
    const wSum = weights.reduce((a, b) => a + b, 0)
    const smoothed = attentionHistoryRef.current.reduce((s, v, i) => s + v * weights[i], 0) / wSum

    return { score: smoothed, isLookingStraight, yaw, pitch }
  }, [])

  const onResults = useCallback((results) => {
    if (isProcessingRef.current) return
    isProcessingRef.current = true
    try {
      if (results.detections?.length > 0) {
        const data = calculateAttention(results.detections[0])
        const isFocused = data.score >= FOCUS_THRESHOLD && data.isLookingStraight
        updateStats(isFocused ? 'focused' : 'distracted')
        setAttentionData({ ...data, isFocused, hasface: true })
      } else {
        updateStats('noFace')
        setAttentionData({ hasface: false, isFocused: false, score: 0 })
      }
    } finally {
      isProcessingRef.current = false
    }
  }, [calculateAttention, updateStats])

  const start = useCallback(async (videoEl, canvasEl) => {
    if (typeof window.FaceDetection === 'undefined') {
      setStatus('error')
      return false
    }
    setStatus('starting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' }, audio: false })
      videoStreamRef.current = stream
      videoEl.srcObject = stream
      await new Promise((res, rej) => {
        videoEl.onloadedmetadata = async () => { await videoEl.play(); res() }
        videoEl.onerror = rej
        setTimeout(() => rej(new Error('Timeout')), 10000)
      })

      const fd = new window.FaceDetection({
        locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${f}`
      })
      fd.setOptions({ model: 'short', minDetectionConfidence: 0.5 })
      fd.onResults(onResults)
      faceDetectionRef.current = fd

      const cam = new window.Camera(videoEl, {
        onFrame: async () => { if (fd && !isProcessingRef.current) await fd.send({ image: videoEl }) },
        width: 640, height: 480,
      })
      cameraRef.current = cam
      await cam.start()

      canvasEl.width = 640
      canvasEl.height = 480
      setStatus('active')
      statsRef.current = { total: 0, focused: 0, distracted: 0, noFace: 0, start: null }
      attentionHistoryRef.current = []
      return true
    } catch (err) {
      setStatus('error')
      stop()
      return false
    }
  }, [onResults])

  const stop = useCallback(() => {
    try { cameraRef.current?.stop() } catch {}
    try { faceDetectionRef.current?.close() } catch {}
    faceDetectionRef.current = null
    cameraRef.current = null
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(t => t.stop())
      videoStreamRef.current = null
    }
    setStatus('idle')
    setAttentionData(null)
  }, [])

  const resetStats = useCallback(() => {
    statsRef.current = { total: 0, focused: 0, distracted: 0, noFace: 0, start: null }
    attentionHistoryRef.current = []
    setStats({ total: 0, focused: 0, distracted: 0, noFace: 0 })
    setAttentionData(null)
  }, [])

  const getFocusPercent = () =>
    stats.total > 0 ? ((stats.focused / stats.total) * 100).toFixed(1) : '0.0'

  const getDuration = () =>
    statsRef.current.start ? ((Date.now() - statsRef.current.start) / 60000).toFixed(1) : '0.0'

  return { status, stats, attentionData, start, stop, resetStats, getFocusPercent, getDuration }
}
