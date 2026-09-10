import type { Component } from '@/types'

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock'
export type ExpiryStatus = 'safe' | 'expiring-soon' | 'expired' | 'no-expiry'

export function getStockStatus(component: Pick<Component, 'quantity' | 'minStock'>): StockStatus {
  if (component.quantity <= 0) return 'out-of-stock'
  if (component.quantity < component.minStock) return 'low-stock'
  return 'in-stock'
}

export const stockStatusLabel: Record<StockStatus, string> = {
  'in-stock': 'In Stock',
  'low-stock': 'Low Stock',
  'out-of-stock': 'Out of Stock',
}

export function getExpiryStatus(component: Component): ExpiryStatus {
  if (!component.expiryDate) {
    return 'no-expiry'
  }

  const today = new Date()
  const expiry = new Date(component.expiryDate)

  const difference =
    expiry.getTime() - today.getTime()

  const daysRemaining = Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  )

  if (daysRemaining < 0) {
    return 'expired'
  }

  if (daysRemaining <= 30) {
    return 'expiring-soon'
  }

  return 'safe'
}

export function getDaysRemaining(
  expiryDate?: string
): number | null {
  if (!expiryDate) return null

  const today = new Date()
  const expiry = new Date(expiryDate)

  const difference =
    expiry.getTime() - today.getTime()

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  )
}

export const expiryStatusLabel: Record<
  ExpiryStatus,
  string
> = {
  safe: 'Safe',
  'expiring-soon': 'Expiring Soon',
  expired: 'Expired',
  'no-expiry': 'No Expiry',
}