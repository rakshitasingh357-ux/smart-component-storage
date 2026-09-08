export type ComponentCategory =
  | "Microcontrollers"
  | "Sensors"
  | "Resistors"
  | "Capacitors"
  | "LEDs"

export interface Component {
  id: string
  name: string
  category: ComponentCategory
  quantity: number
  minStock: number
  cabinet: string
  shelf: string
  slot: string
  description: string
  updatedAgo: string
  lastActivity: string
  expiryDate: string | null
  shelfLife: string | number | null
}