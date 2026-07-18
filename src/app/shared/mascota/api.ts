import type { MascotState, MascotAPI } from './types'

function createAPI(): MascotAPI {
  let state: MascotState = 'idle'
  const listeners = new Set<(s: MascotState) => void>()

  return {
    setState(next: MascotState) {
      if (next === state) return
      state = next
      listeners.forEach((fn) => fn(state))
    },
    getState() {
      return state
    },
    subscribe(cb: (s: MascotState) => void) {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
  }
}

export const mascotAPI = createAPI()
