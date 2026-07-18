import type { Variants, Transition } from 'framer-motion'
import type { MascotSize } from './types'

export const SIZE_MAP: Record<MascotSize, number> = {
  sm: 130,
  md: 220,
  lg: 320,
}

export const SPRING: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 20,
  mass: 1,
}

export const SPRING_BOUNCE: Transition = {
  type: 'spring',
  stiffness: 350,
  damping: 12,
  mass: 0.8,
}

export const EASE: Transition = {
  duration: 0.4,
  ease: [0.25, 0.1, 0.25, 1],
}

export function getBodyVariants(): Variants {
  return {
    idle: {
      y: [0, -4, 0],
      scale: [1, 1.015, 1],
      transition: {
        duration: 3.2,
        repeat: Infinity,
        ease: [0.45, 0, 0.55, 1],
      },
    },
    listening: {
      y: [0, -2, 1, -2, 0],
      rotate: [0, 2, -1, 2, 0],
      scale: [1, 1.008, 1],
      transition: {
        duration: 3.5,
        repeat: Infinity,
        ease: [0.45, 0, 0.55, 1],
      },
    },
    thinking: {
      y: [0, -5, 0],
      rotate: [0, 0, 4, 0],
      transition: {
        duration: 2.8,
        repeat: Infinity,
        ease: [0.45, 0, 0.55, 1],
      },
    },
    talking: {
      y: [0, -2, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: [0.45, 0, 0.55, 1],
      },
    },
    happy: {
      y: [0, -10, 0, -5, 0],
      rotate: [0, -2, 2, -2, 0],
      scale: [1, 1.04, 1, 1.02, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: [0.45, 0, 0.55, 1],
      },
    },
  }
}

export function getHeadVariants(): Variants {
  return {
    idle: {
      rotate: [0, 0.5, -0.3, 0.5, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: [0.45, 0, 0.55, 1],
      },
    },
    listening: {
      rotate: [0, 3, 1, 3, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: [0.45, 0, 0.55, 1],
      },
    },
    thinking: {
      rotate: [0, 0, 6, 0],
      y: [0, -1, -3, -1, 0],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: [0.45, 0, 0.55, 1],
      },
    },
    talking: {
      rotate: [0, 0.5, -0.5, 0.5, 0],
      transition: {
        duration: 0.7,
        repeat: Infinity,
        ease: [0.45, 0, 0.55, 1],
      },
    },
    happy: {
      rotate: [0, 1, -1, 1, 0],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: [0.45, 0, 0.55, 1],
      },
    },
  }
}

export function getPupilVariants(): Variants {
  return {
    idle: {
      y: [0, -0.5, 0.5, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: [0.45, 0, 0.55, 1],
      },
    },
    listening: {
      y: 0,
      scale: 1.1,
      transition: SPRING,
    },
    thinking: {
      y: -4,
      scale: 0.85,
      transition: SPRING,
    },
    talking: {
      y: [0, -0.5, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: [0.45, 0, 0.55, 1],
      },
    },
    happy: {
      y: 0,
      scale: 1.1,
      transition: SPRING,
    },
  }
}

export function getYarnVariants(): Variants {
  return {
    idle: {
      rotate: [0, 3, -2, 3, 0],
      y: [0, -1, 1, -1, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: [0.45, 0, 0.55, 1],
      },
    },
    listening: {
      rotate: [0, 2, -1, 2, 0],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: [0.45, 0, 0.55, 1],
      },
    },
    thinking: {
      rotate: [0, 8, -5, 8, 0],
      y: [0, -3, 2, -3, 0],
      transition: {
        duration: 1.8,
        repeat: Infinity,
        ease: [0.45, 0, 0.55, 1],
      },
    },
    talking: {
      rotate: [0, 2, -1, 2, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: [0.45, 0, 0.55, 1],
      },
    },
    happy: {
      rotate: [0, 5, -3, 5, 0],
      y: [0, -2, 1, -2, 0],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: [0.45, 0, 0.55, 1],
      },
    },
  }
}
