import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Square, Loader2 } from 'lucide-react'

type RecordingState = 'idle' | 'recording' | 'processing' | 'success'

interface VoiceRecorderProps {
  onTranscript: (text: string) => void
}

export default function VoiceRecorder({ onTranscript }: VoiceRecorderProps) {
  const [state, setState] = useState<RecordingState>('idle')
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const startRecording = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('您的浏览器不支持语音输入')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'zh-CN'
    recognition.continuous = true
    recognition.interimResults = true
    recognitionRef.current = recognition

    let finalTranscript = ''

    recognition.onstart = () => setState('recording')

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        }
      }
    }

    recognition.onerror = () => {
      setState('idle')
    }

    recognition.onend = () => {
      if (finalTranscript) {
        onTranscript(finalTranscript)
        setState('success')
        setTimeout(() => setState('idle'), 1500)
      } else {
        setState('idle')
      }
    }

    recognition.start()
  }, [onTranscript])

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop()
    setState('processing')
  }, [])

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.button
            key="idle"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={startRecording}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-[var(--accent-morandi)] text-white hover:opacity-90 transition-opacity"
          >
            <Mic size={16} />
            语音输入
          </motion.button>
        )}

        {state === 'recording' && (
          <motion.div
            key="recording"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex items-center gap-3"
          >
            {/* Pulsing red dot */}
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-[var(--error)]" />
              <motion.div
                className="absolute inset-0 rounded-full bg-[var(--error)]"
                animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>

            {/* Waveform bars */}
            <div className="flex items-center gap-1 h-6">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full bg-[var(--error)]"
                  animate={{ height: [4, 20, 8, 24, 6] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>

            <button
              onClick={stopRecording}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-[var(--bg-card)] text-[var(--error)] border border-[var(--error)] hover:bg-[var(--error)] hover:text-white transition-colors"
            >
              <Square size={12} fill="currentColor" />
              停止
            </button>
          </motion.div>
        )}

        {state === 'processing' && (
          <motion.div
            key="processing"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex items-center gap-2 text-[var(--text-secondary)]"
          >
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">识别中...</span>
          </motion.div>
        )}

        {state === 'success' && (
          <motion.div
            key="success"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex items-center gap-2 text-[var(--success)]"
          >
            <span className="text-sm">✓ 识别完成</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
