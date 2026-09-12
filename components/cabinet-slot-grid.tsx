"use client";

import React, { useState } from "react";

export interface SlotComponent {
  id?: string;
  name?: string;
  partNumber?: string;
  quantity?: number;
  qty?: number;
  batch?: string;
  batchNumber?: string;
  alert?: boolean;
}

export interface SlotData {
  id: string;
  occupied?: boolean;
  component?: SlotComponent | null;
  alert?: boolean;
}

export interface CabinetRow {
  id: string;
  label?: string;
  slots?: SlotData[];
}

export interface Cabinet {
  cols?: number;
  rows?: CabinetRow[];
}

interface CabinetSlotGridProps {
  cabinet?: Cabinet;
  selectedSlot?: string | null;
  onSelectSlot?: (slotId: string) => void;
  onAddComponent?: (slotId: string, component: SlotComponent) => void;
}

export function CabinetSlotGrid({
  cabinet,
  selectedSlot: controlledSelectedSlot,
  onSelectSlot,
  onAddComponent,
}: CabinetSlotGridProps) {
  const [internalSelected, setInternalSelected] = useState<string>("A1");
  const activeSlotId = controlledSelectedSlot ?? internalSelected;

  const [dynamicSlots, setDynamicSlots] = useState<Record<string, SlotComponent>>({});

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    partNumber: "",
    quantity: 1,
    batch: "",
  });

  const cols = cabinet?.cols || 4;
  const rawRows = cabinet?.rows || [
    { id: "A", label: "ROW-A", slots: [] },
    { id: "B", label: "ROW-B", slots: [] },
  ];

  const cleanSlotKey = (id?: string) =>
    (id || "").replace(/^ROW-/, "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();

  const activeKey = cleanSlotKey(activeSlotId);
  const activeRowLetter = activeKey.charAt(0) || "A";
  const activeSlotCol = activeKey.slice(1) || "1";

  const handleSelect = (slotId: string) => {
    setInternalSelected(slotId);
    setIsAdding(false);
    if (onSelectSlot) onSelectSlot(slotId);
  };

  let selectedSlotData: SlotData | null = null;
  let selectedComponent: SlotComponent | null = dynamicSlots[activeKey] || null;

  for (const r of rawRows) {
    if (Array.isArray(r.slots)) {
      const match = r.slots.find((s) => cleanSlotKey(s.id) === activeKey);
      if (match) {
        selectedSlotData = match;
        if (!selectedComponent && match.component) {
          selectedComponent = match.component;
        }
        break;
      }
    }
  }

  const isSlotAlert = Boolean(selectedSlotData?.alert || selectedComponent?.alert);

  const handleCreateComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.partNumber.trim()) return;

    const newComponent: SlotComponent = {
      name: formData.partNumber.trim(),
      partNumber: formData.partNumber.trim(),
      quantity: Number(formData.quantity) || 1,
      batch: formData.batch.trim() || `BAT-${Math.floor(100 + Math.random() * 900)}`,
      alert: false,
    };

    setDynamicSlots((prev) => ({
      ...prev,
      [activeKey]: newComponent,
    }));

    if (onAddComponent) {
      onAddComponent(`ROW-${activeKey}`, newComponent);
    }

    setFormData({ partNumber: "", quantity: 1, batch: "" });
    setIsAdding(false);
  };

  return (
    <div className="w-full max-w-md select-none font-sans text-white">
      <div className="mb-3 text-[11px] font-bold tracking-widest text-[#a855f7]/80 uppercase">
        Slot Grid
      </div>

      <div className="rounded-3xl border border-purple-900/40 bg-[#160628]/90 p-5 shadow-2xl backdrop-blur-xl">
        {/* Column Numbers Header */}
        <div className="mb-3 flex items-center">
          <div className="w-20 shrink-0" />
          <div className="grid flex-1 grid-cols-4 gap-3 text-center text-xs font-semibold text-purple-300/70">
            {Array.from({ length: cols }, (_, i) => (
              <span key={i + 1}>Slot {i + 1}</span>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-3">
          {rawRows.map((rowItem) => {
            const rawId = typeof rowItem === "object" ? rowItem.id : rowItem;
            const letter = String(rawId).replace(/^ROW-/, "").toUpperCase();
            const rowLabel = `ROW-${letter}`;

            return (
              <div key={letter} className="flex items-center">
                <span className="w-20 shrink-0 text-xs font-semibold tracking-wider text-purple-300/80">
                  {rowLabel}
                </span>

                <div className="grid flex-1 grid-cols-4 gap-3">
                  {Array.from({ length: cols }, (_, colIndex) => {
                    const colNum = colIndex + 1;
                    const standardSlotKey = `${letter}${colNum}`;
                    const displaySlotId = `ROW-${standardSlotKey}`;

                    const slotData = rowItem.slots?.find(
                      (s) => cleanSlotKey(s.id) === standardSlotKey
                    );

                    const component =
                      dynamicSlots[standardSlotKey] || slotData?.component || null;
                    const isOccupied = Boolean(component);
                    const isSelected = activeKey === standardSlotKey;
                    const hasAlert = Boolean(slotData?.alert || component?.alert);

                    return (
                      <button
                        key={standardSlotKey}
                        type="button"
                        onClick={() => handleSelect(displaySlotId)}
                        className={`relative flex h-14 w-full items-center justify-center rounded-2xl transition-all duration-150 outline-none ${
                          isSelected
                            ? "ring-2 ring-purple-200/90 ring-offset-2 ring-offset-[#160628]"
                            : ""
                        } ${
                          isOccupied
                            ? "bg-[#5b1988] hover:bg-[#6c1e9f]"
                            : "bg-[#250e3e]/50 hover:bg-[#2e124d]/70"
                        }`}
                      >
                        {isOccupied && (
                          <span
                            className={`h-2 w-2 rounded-full transition-colors ${
                              hasAlert
                                ? "bg-[#f43f5e] shadow-[0_0_8px_#f43f5e]"
                                : "bg-[#e879f9] shadow-[0_0_6px_#e879f9]"
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6 text-[11px] text-purple-300/80">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#250e3e]" />
            <span>Empty</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#5b1988]" />
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#5b1988] ring-1 ring-inset ring-[#f43f5e]" />
            <span>Alert</span>
          </div>
        </div>
      </div>

      {/* Selected Slot Detail Card */}
      <div className="mt-4 rounded-3xl border border-purple-900/30 bg-[#160628]/90 p-4 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-white">
            ROW-{activeRowLetter} · Slot {activeSlotCol}
          </span>
          {selectedComponent ? (
            isSlotAlert ? (
              <span className="text-xs font-semibold text-rose-400">Needs attention</span>
            ) : (
              <span className="text-xs font-semibold text-emerald-400">Normal</span>
            )
          ) : (
            <span className="text-xs font-semibold text-purple-300/60">Empty Slot</span>
          )}
        </div>

        <div className="mt-3 border-t border-purple-900/30 pt-3 text-xs text-purple-200/70">
          {selectedComponent ? (
            <div className="flex items-center justify-between">
              <div>
                Part:{" "}
                <span className="font-semibold text-white">
                  {selectedComponent.partNumber || selectedComponent.name || "N/A"}
                </span>
              </div>
              <div>
                Qty:{" "}
                <span className="font-semibold text-white">
                  {selectedComponent.quantity ?? selectedComponent.qty ?? 1}
                </span>
              </div>
              <div>
                Batch:{" "}
                <span className="font-semibold text-white">
                  {selectedComponent.batch || selectedComponent.batchNumber || "BAT-001"}
                </span>
              </div>
            </div>
          ) : isAdding ? (
            <form onSubmit={handleCreateComponent} className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-wider text-purple-300/70">
                    Part Name/ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ESP32-WROOM"
                    value={formData.partNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, partNumber: e.target.value })
                    }
                    className="w-full rounded-xl border border-purple-800/60 bg-[#250e3e]/80 px-2.5 py-1.5 text-xs text-white placeholder-purple-400/30 outline-none focus:border-purple-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-wider text-purple-300/70">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full rounded-xl border border-purple-800/60 bg-[#250e3e]/80 px-2.5 py-1.5 text-xs text-white placeholder-purple-400/30 outline-none focus:border-purple-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-wider text-purple-300/70">
                    Batch
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BAT-104"
                    value={formData.batch}
                    onChange={(e) =>
                      setFormData({ ...formData, batch: e.target.value })
                    }
                    className="w-full rounded-xl border border-purple-800/60 bg-[#250e3e]/80 px-2.5 py-1.5 text-xs text-white placeholder-purple-400/30 outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="rounded-xl px-3 py-1 text-xs text-purple-300/70 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#9333ea] px-4 py-1 text-xs font-semibold text-white shadow-md hover:bg-[#a855f7] active:scale-95 transition"
                >
                  Assign to Slot
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <span className="italic text-purple-300/50">
                No component assigned to this slot.
              </span>
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="rounded-xl border border-purple-700/50 bg-[#3b1260]/60 px-3 py-1 text-xs font-medium text-purple-200 hover:border-purple-400 hover:bg-[#5b1988] transition"
              >
                + Add Component
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}