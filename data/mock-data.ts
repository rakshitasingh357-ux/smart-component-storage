import type { Component } from "@/types"

export const components: Component[] = [
  {
    id: "arduino-uno",
    name: "Arduino Uno R3",
    category: "Microcontrollers",
    quantity: 12,
    minStock: 5,
    cabinet: "CAB-A",
    shelf: "A",
    slot: "A1",
    description: "ATmega328P based microcontroller development board",
    updatedAgo: "2h ago",
    lastActivity: "2026-09-05",
    expiryDate: null,
    shelfLife: null,
  },
  {
    id: "esp32",
    name: "ESP32 Dev Board",
    category: "Microcontrollers",
    quantity: 8,
    minStock: 5,
    cabinet: "CAB-A",
    shelf: "A",
    slot: "A2",
    description: "WiFi and Bluetooth enabled microcontroller",
    updatedAgo: "4h ago",
    lastActivity: "2026-09-06",
    expiryDate: null,
    shelfLife: null,
  },
  {
    id: "resistor-kit",
    name: "Resistor Kit",
    category: "Resistors",
    quantity: 150,
    minStock: 50,
    cabinet: "CAB-A",
    shelf: "B",
    slot: "B1",
    description: "Assorted resistor values",
    updatedAgo: "1d ago",
    lastActivity: "2026-09-04",
    expiryDate: null,
    shelfLife: null,
  },
  {
    id: "capacitor-kit",
    name: "Capacitor Kit",
    category: "Capacitors",
    quantity: 85,
    minStock: 30,
    cabinet: "CAB-A",
    shelf: "B",
    slot: "B2",
    description: "Assorted ceramic and electrolytic capacitors",
    updatedAgo: "1d ago",
    lastActivity: "2026-09-03",
    expiryDate: null,
    shelfLife: null,
  },
  {
    id: "red-led",
    name: "Red LED",
    category: "LEDs",
    quantity: 45,
    minStock: 20,
    cabinet: "CAB-B",
    shelf: "A",
    slot: "A1",
    description: "5mm red LEDs",
    updatedAgo: "3h ago",
    lastActivity: "2026-09-06",
    expiryDate: null,
    shelfLife: null,
  },
  {
    id: "dht22",
    name: "DHT22 Sensor",
    category: "Sensors",
    quantity: 6,
    minStock: 10,
    cabinet: "CAB-B",
    shelf: "A",
    slot: "A2",
    description: "Temperature and humidity sensor",
    updatedAgo: "5h ago",
    lastActivity: "2026-09-05",
    expiryDate: null,
    shelfLife: null,
  },
]

export const cabinets = [
  {
    id: "CAB-A",
    name: "CAB-A",
    status: "healthy",
    temperature: 24,
    humidity: 45,
    maxTemperature: 30,
    minHumidity: 20,
    maxHumidity: 70,
    notes: "Store in a dry environment.",
    lastActivity: "2026-09-05",

    rows: [
      {
        id: "ROW-A",
        slots: [
          {
            id: "A1",
            component: components[0],
          },
          {
            id: "A2",
            component: components[1],
          },
          {
            id: "A3",
            component: null,
          },
          {
            id: "A4",
            component: null,
          },
        ],
      },
      {
        id: "ROW-B",
        slots: [
          {
            id: "B1",
            component: components[2],
          },
          {
            id: "B2",
            component: components[3],
          },
          {
            id: "B3",
            component: null,
          },
          {
            id: "B4",
            component: null,
          },
        ],
      },
    ],
  },

  {
    id: "CAB-B",
    name: "CAB-B",
    status: "warning",
    temperature: 28,
    humidity: 55,
    maxTemperature: 30,
    minHumidity: 20,
    maxHumidity: 70,
    notes: "Check ventilation regularly.",
    lastActivity: "2026-09-06",

    rows: [
      {
        id: "ROW-A",
        slots: [
          {
            id: "A1",
            component: components[4],
          },
          {
            id: "A2",
            component: components[5],
          },
          {
            id: "A3",
            component: null,
          },
          {
            id: "A4",
            component: null,
          },
        ],
      },
      {
        id: "ROW-B",
        slots: [
          {
            id: "B1",
            component: null,
          },
          {
            id: "B2",
            component: null,
          },
          {
            id: "B3",
            component: null,
          },
          {
            id: "B4",
            component: null,
          },
        ],
      },
    ],
  },
]

export const temperatureHistory = [
  {
    time: "09:00",
    value: 22,
  },
  {
    time: "10:00",
    value: 23,
  },
  {
    time: "11:00",
    value: 24,
  },
  {
    time: "12:00",
    value: 25,
  },
  {
    time: "13:00",
    value: 24,
  },
  {
    time: "14:00",
    value: 26,
  },
  {
    time: "15:00",
    value: 24,
  },
]

export const humidityHistory = [
  {
    time: "09:00",
    value: 40,
  },
  {
    time: "10:00",
    value: 42,
  },
  {
    time: "11:00",
    value: 45,
  },
  {
    time: "12:00",
    value: 48,
  },
  {
    time: "13:00",
    value: 46,
  },
  {
    time: "14:00",
    value: 50,
  },
  {
    time: "15:00",
    value: 45,
  },
]

export const alerts = [
  {
    id: "alert-1",
    title: "Low Stock Warning",
    message: "Arduino Uno R3 stock is running low.",
    level: "warning",
    time: "10 minutes ago",
  },
  {
    id: "alert-2",
    title: "Temperature Warning",
    message: "Cabinet B temperature is above the recommended range.",
    level: "critical",
    time: "25 minutes ago",
  },
  {
    id: "alert-3",
    title: "Humidity Notice",
    message: "Cabinet A humidity level needs attention.",
    level: "info",
    time: "1 hour ago",
  },
]
export const userProfile = {
  name: "Admin User",
  email: "admin@smartstorage.com",
  role: "Administrator",
  avatar: "",
}