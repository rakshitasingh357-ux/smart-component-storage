"use client"

import { components } from "@/data/mock-data"

function getExpiryStatus(expiryDate?: string) {
  if (!expiryDate) {
    return "no-expiry"
  }

  const today = new Date()
  const expiry = new Date(expiryDate)

  today.setHours(0, 0, 0, 0)
  expiry.setHours(0, 0, 0, 0)

  const difference =
    Math.ceil(
      (expiry.getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
    )

  if (difference < 0) {
    return "expired"
  }

  if (difference <= 30) {
    return "expiring-soon"
  }

  return "safe"
}

export default function ExpiryPage() {
  const expired = components.filter(
    (component) =>
      component.expiryDate &&
      getExpiryStatus(component.expiryDate) === "expired"
  )

  const expiringSoon = components.filter(
    (component) =>
      component.expiryDate &&
      getExpiryStatus(component.expiryDate) === "expiring-soon"
  )

  const safe = components.filter(
    (component) =>
      component.expiryDate &&
      getExpiryStatus(component.expiryDate) === "safe"
  )

  const noExpiry = components.filter(
    (component) => !component.expiryDate
  )

  return (
    <main className="min-h-screen bg-background p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Expiry Tracker
        </h1>

        <p className="text-muted-foreground mt-2">
          Monitor component expiry and shelf life
        </p>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-red-500 mb-4">
          Expired ({expired.length})
        </h2>

        <div className="space-y-3">
          {expired.map((component) => (
            <div
              key={component.id}
              className="border rounded-xl p-4"
            >
              <h3 className="font-semibold">
                {component.name}
              </h3>

              <p className="text-sm text-muted-foreground">
                {component.category}
              </p>

              <p className="text-sm text-red-500 mt-2">
                Expiry Date: {component.expiryDate}
              </p>

              <p className="text-sm text-muted-foreground">
                Quantity: {component.quantity}
              </p>
            </div>
          ))}

          {expired.length === 0 && (
            <p className="text-muted-foreground">
              No expired components
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-orange-500 mb-4">
          Expiring Soon ({expiringSoon.length})
        </h2>

        <div className="space-y-3">
          {expiringSoon.map((component) => (
            <div
              key={component.id}
              className="border rounded-xl p-4"
            >
              <h3 className="font-semibold">
                {component.name}
              </h3>

              <p className="text-sm text-muted-foreground">
                {component.category}
              </p>

              <p className="text-sm text-orange-500 mt-2">
                Expiry Date: {component.expiryDate}
              </p>

              <p className="text-sm text-muted-foreground">
                Quantity: {component.quantity}
              </p>
            </div>
          ))}

          {expiringSoon.length === 0 && (
            <p className="text-muted-foreground">
              No components expiring soon
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-green-500 mb-4">
          Safe ({safe.length})
        </h2>

        <div className="space-y-3">
          {safe.map((component) => (
            <div
              key={component.id}
              className="border rounded-xl p-4"
            >
              <h3 className="font-semibold">
                {component.name}
              </h3>

              <p className="text-sm text-muted-foreground">
                {component.category}
              </p>

              <p className="text-sm text-green-500 mt-2">
                Expiry Date: {component.expiryDate}
              </p>

              <p className="text-sm text-muted-foreground">
                Quantity: {component.quantity}
              </p>
            </div>
          ))}

          {safe.length === 0 && (
            <p className="text-muted-foreground">
              No safe components with expiry dates
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">
          No Expiry Date ({noExpiry.length})
        </h2>

        <div className="space-y-3">
          {noExpiry.map((component) => (
            <div
              key={component.id}
              className="border rounded-xl p-4"
            >
              <h3 className="font-semibold">
                {component.name}
              </h3>

              <p className="text-sm text-muted-foreground">
                {component.category}
              </p>

              <p className="text-sm text-muted-foreground mt-2">
                No expiry date available
              </p>

              <p className="text-sm text-muted-foreground">
                Quantity: {component.quantity}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}