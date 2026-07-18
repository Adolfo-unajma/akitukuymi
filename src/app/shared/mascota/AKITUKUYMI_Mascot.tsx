import { useEffect, useRef, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getBodyVariants,
  getPupilVariants,
  getYarnVariants,
  SIZE_MAP,
  SPRING,
  SPRING_BOUNCE,
  EASE,
} from './animations'
import { mascotAPI } from './api'
import type { MascotProps, MascotState } from './types'

const BLINK_MIN = 2000
const BLINK_MAX = 5500
const BLINK_DURATION = 0.1

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

const AUTO_IDLE_TIMEOUT: Partial<Record<MascotState, number>> = {
  happy: 2800,
}

export function AKITUKUYMI_Mascot({
  state: externalState,
  size = 'md',
  onStateChange,
}: MascotProps) {
  const px = SIZE_MAP[size]
  const [current, setCurrent] = useState<MascotState>('idle')
  const [blink, setBlink] = useState(false)
  const [talkOpen, setTalkOpen] = useState(false)
  const blinkTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const scheduleBlink = useCallback(() => {
    blinkTimer.current = setTimeout(() => {
      setBlink(true)
      setTimeout(() => setBlink(false), BLINK_DURATION * 1000)
      scheduleBlink()
    }, rand(BLINK_MIN, BLINK_MAX))
  }, [])

  useEffect(() => {
    scheduleBlink()
    return () => clearTimeout(blinkTimer.current)
  }, [scheduleBlink])

  useEffect(() => {
    if (current === 'talking') {
      let open = false
      const t = setInterval(() => {
        open = !open
        setTalkOpen(open)
      }, rand(180, 300))
      return () => clearInterval(t)
    }
    setTalkOpen(false)
    return undefined
  }, [current])

  useEffect(() => {
    if (!externalState || externalState === current) return
    setCurrent(externalState)
  }, [externalState])

  useEffect(() => {
    const unsub = mascotAPI.subscribe((s) => {
      if (s !== current) setCurrent(s)
    })
    return unsub
  }, [current])

  useEffect(() => {
    onStateChange?.(current)
  }, [current, onStateChange])

  useEffect(() => {
    const ms = AUTO_IDLE_TIMEOUT[current]
    if (!ms) return
    const t = setTimeout(() => setCurrent('idle'), ms)
    return () => clearTimeout(t)
  }, [current])

  const bodyV = getBodyVariants()
  const pupilV = getPupilVariants()
  const yarnV = getYarnVariants()

  const isHappy = current === 'happy'
  const isTalking = current === 'talking'
  const isThinking = current === 'thinking'
  const isListening = current === 'listening'

  return (
    <motion.div
      style={{
        position: 'relative',
        width: px,
        height: px,
        cursor: current === 'idle' ? 'pointer' : 'default',
        willChange: 'transform',
      }}
      variants={bodyV}
      animate={current}
      initial={false}
      onClick={() => {
        if (current === 'idle') setCurrent('happy')
      }}
      role="img"
      aria-label={`AKITUKUYMI — ${current}`}
    >
      <svg
        viewBox="0 0 200 200"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          overflow: 'visible',
        }}
      >
        <defs>
          <pattern
            id="knit"
            width="8"
            height="7"
            patternUnits="userSpaceOnUse"
            patternTransform="scale(1.6)"
          >
            <path
              d="M2 5 L4 1 L6 5"
              fill="none"
              stroke="#d4b8a0"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.3"
            />
          </pattern>
          <radialGradient id="bodyGrad" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#faf0e6" />
            <stop offset="100%" stopColor="#f0dcc8" />
          </radialGradient>
          <radialGradient id="earGrad" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#f5e6d3" />
            <stop offset="100%" stopColor="#e0c8b0" />
          </radialGradient>
        </defs>

        {/* shadow */}
        <ellipse cx="100" cy="170" rx="48" ry="6" fill="rgba(74,44,26,0.07)" />

        {/* ears */}
        <g id="ears">
          <motion.g>
            <circle cx="36" cy="88" r="18" fill="url(#earGrad)" stroke="#dcc4ae" strokeWidth="1.5" />
            <circle cx="36" cy="88" r="9" fill="#dcc4ae" opacity="0.4" />
            <circle cx="164" cy="88" r="18" fill="url(#earGrad)" stroke="#dcc4ae" strokeWidth="1.5" />
            <circle cx="164" cy="88" r="9" fill="#dcc4ae" opacity="0.4" />
          </motion.g>
        </g>

        {/* arms */}
        <g id="arms">
          <motion.g
            animate={
              isHappy
                ? { rotate: [-5, 5, -5], y: [0, -3, 0] }
                : isListening
                ? { rotate: [0, -3, 0] }
                : {}
            }
            transition={
              isHappy
                ? { duration: 1, repeat: Infinity, ease: 'easeInOut' }
                : isListening
                ? { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                : {}
            }
            style={{ transformOrigin: '36px 122px' }}
          >
            <ellipse cx="36" cy="124" rx="11" ry="15" fill="url(#earGrad)" stroke="#dcc4ae" strokeWidth="1.5" />
          </motion.g>
          <motion.g
            animate={
              isHappy
                ? { rotate: [5, -5, 5], y: [0, -3, 0] }
                : isListening
                ? { rotate: [0, 3, 0] }
                : {}
            }
            transition={
              isHappy
                ? { duration: 1, repeat: Infinity, ease: 'easeInOut' }
                : isListening
                ? { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                : {}
            }
            style={{ transformOrigin: '164px 122px' }}
          >
            <ellipse cx="164" cy="124" rx="11" ry="15" fill="url(#earGrad)" stroke="#dcc4ae" strokeWidth="1.5" />
          </motion.g>
        </g>

        {/* body */}
        <g id="body">
          <circle cx="100" cy="102" r="66" fill="url(#bodyGrad)" stroke="#dcc4ae" strokeWidth="2" />
          <circle cx="100" cy="102" r="66" fill="url(#knit)" />
        </g>

        {/* face patch */}
        <ellipse cx="100" cy="108" rx="44" ry="38" fill="#faf5ee" opacity="0.45" />

        {/* eyes */}
        <g id="eyes">
          {/* left eye */}
          <circle cx="78" cy="95" r="13" fill="white" stroke="#d4b8a0" strokeWidth="1" />
          <motion.circle
            cx="78"
            cy="97"
            r="8"
            fill="#4a2c1a"
            variants={pupilV}
            animate={current}
            initial={false}
          />
          <circle cx="75" cy="93" r="3" fill="white" />
          <circle cx="80" cy="100" r="1.5" fill="rgba(255,255,255,0.5)" />

          {/* right eye */}
          <circle cx="122" cy="95" r="13" fill="white" stroke="#d4b8a0" strokeWidth="1" />
          <motion.circle
            cx="122"
            cy="97"
            r="8"
            fill="#4a2c1a"
            variants={pupilV}
            animate={current}
            initial={false}
          />
          <circle cx="119" cy="93" r="3" fill="white" />
          <circle cx="124" cy="100" r="1.5" fill="rgba(255,255,255,0.5)" />
        </g>

        {/* happy eyes overlay */}
        <AnimatePresence>
          {isHappy && (
            <motion.g
              key="happy-eyes"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={SPRING_BOUNCE}
            >
              <path
                d="M68 92 Q78 80 88 92"
                fill="none"
                stroke="#4a2c1a"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M112 92 Q122 80 132 92"
                fill="none"
                stroke="#4a2c1a"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </motion.g>
          )}
        </AnimatePresence>

        {/* blink overlay */}
        <AnimatePresence>
          {blink && (
            <motion.g
              key="blink"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: [0, 1, 0] }}
              exit={{ scaleY: 0 }}
              transition={{ duration: BLINK_DURATION }}
            >
              <rect
                x="60"
                y="82"
                width="80"
                height="24"
                rx="12"
                fill="#faf5ee"
                opacity="0.95"
              />
            </motion.g>
          )}
        </AnimatePresence>

        {/* blush */}
        <g id="blush">
          <motion.ellipse
            cx="62"
            cy="112"
            rx="8"
            ry="5"
            fill="#e8a094"
            opacity="0.3"
            animate={isHappy ? { opacity: 0.5, rx: 9, ry: 6 } : { opacity: 0.3, rx: 8, ry: 5 }}
            transition={SPRING}
          />
          <motion.ellipse
            cx="138"
            cy="112"
            rx="8"
            ry="5"
            fill="#e8a094"
            opacity="0.3"
            animate={isHappy ? { opacity: 0.5, rx: 9, ry: 6 } : { opacity: 0.3, rx: 8, ry: 5 }}
            transition={SPRING}
          />
        </g>

        {/* mouth */}
        <g id="mouth">
          <AnimatePresence mode="wait">
            {isTalking ? (
              <motion.ellipse
                key="mouth-open"
                cx="100"
                cy="116"
                rx="7"
                ry={talkOpen ? 5 : 1.5}
                fill="#8b5a3a"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={EASE}
              />
            ) : isHappy ? (
              <motion.path
                key="mouth-happy"
                d="M88 116 Q100 126 112 116"
                fill="none"
                stroke="#8b5a3a"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                exit={{ pathLength: 0 }}
                transition={SPRING}
              />
            ) : (
              <motion.path
                key="mouth-idle"
                d="M93 115 Q100 120 107 115"
                fill="none"
                stroke="#8b5a3a"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                exit={{ pathLength: 0 }}
                transition={EASE}
              />
            )}
          </AnimatePresence>
        </g>

        {/* yarn tuft */}
        <motion.g
          id="yarn"
          variants={yarnV}
          animate={current}
          initial={false}
          style={{ transformOrigin: '100px 35px' }}
        >
          <path
            d="M90 36 Q86 22 91 17 Q96 12 100 20 Q104 12 109 17 Q114 22 110 36"
            fill="none"
            stroke="#d4845a"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M90 36 Q86 22 91 17 Q96 12 100 20 Q104 12 109 17 Q114 22 110 36"
            fill="none"
            stroke="#c47050"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.4"
          />
        </motion.g>

        {/* thinking yarn accent */}
        {isThinking && (
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={SPRING}
          >
            <circle cx="100" cy="22" r="3" fill="#d4845a" opacity="0.6" />
            <circle cx="100" cy="12" r="2" fill="#d4845a" opacity="0.4" />
          </motion.g>
        )}
      </svg>
    </motion.div>
  )
}
