export type MascotState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'talking'
  | 'happy'

export type MascotSize = 'sm' | 'md' | 'lg'

export interface MascotAPI {
  setState: (state: MascotState) => void
  getState: () => MascotState
  subscribe: (cb: (state: MascotState) => void) => () => void
}

export interface MascotProps {
  state?: MascotState
  size?: MascotSize
  onStateChange?: (state: MascotState) => void
}
