import { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
}

type RecorderState = 'idle' | 'recording' | 'processing' | 'success';

export default function VoiceRecorder({ onTranscript }: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>('idle');
  const [error, setError] = useState<string>('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('浏览器不支持语音识别');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        onTranscript(finalTranscript);
      }
    };

    recognition.onerror = () => {
      setState('idle');
      setError('识别失败，请重试');
    };

    recognition.onend = () => {
      if (state === 'recording') {
        setState('processing');
        setTimeout(() => {
          setState('success');
          setTimeout(() => setState('idle'), 1200);
        }, 800);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  useEffect(() => {
    if (state === 'recording') {
      const timer = setTimeout(() => {
        handleStop();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const handleStart = useCallback(() => {
    setError('');
    if (!recognitionRef.current) {
      setError('浏览器不支持语音识别');
      return;
    }
    try {
      recognitionRef.current.start();
      setState('recording');
    } catch {
      setError('无法启动录音');
    }
  }, []);

  const handleStop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setState('processing');
    setTimeout(() => {
      setState('success');
      setTimeout(() => setState('idle'), 1200);
    }, 800);
  }, []);

  const toggleRecording = () => {
    if (state === 'idle' || state === 'success') {
      handleStart();
    } else if (state === 'recording') {
      handleStop();
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={toggleRecording}
        disabled={state === 'processing'}
        className="relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200"
        style={{
          backgroundColor: state === 'recording' ? '#C47C7C' : state === 'success' ? '#7BAE7F' : '#5B7E71',
          transform: state === 'idle' ? 'scale(1)' : undefined,
        }}
      >
        {state === 'recording' && (
          <>
            <span
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: '#C47C7C',
                animation: 'voicePulse 1.5s infinite',
              }}
            />
            <span className="absolute inset-0 rounded-full" style={{ backgroundColor: '#C47C7C', animation: 'voicePulse 1.5s infinite 0.5s' }} />
          </>
        )}
        <span className="relative z-10">
          <AnimatePresence mode="wait">
            {state === 'success' ? (
              <motion.div
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Check className="w-5 h-5 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="mic"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Mic className="w-5 h-5 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </span>
      </button>

      <AnimatePresence>
        {state === 'recording' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col items-center gap-2 overflow-hidden"
          >
            <div className="flex items-end gap-[3px] h-6">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-[3px] rounded-full"
                  style={{ backgroundColor: '#C47C7C' }}
                  animate={{
                    height: [8, 24, 12, 20, 10],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    delay: i * 0.12,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
            <span className="text-xs" style={{ color: '#C47C7C', fontFamily: 'Inter, system-ui, sans-serif' }}>
              正在聆听...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state === 'processing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: '#6B6B6B' }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
            <span className="text-xs ml-1" style={{ color: '#6B6B6B', fontFamily: 'Inter, system-ui, sans-serif' }}>
              正在识别...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <span className="text-xs" style={{ color: '#C47C7C' }}>{error}</span>
      )}

      <style>{`
        @keyframes voicePulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
