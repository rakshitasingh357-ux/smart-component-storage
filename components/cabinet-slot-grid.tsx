"use client";

import React, { useState } from "react";

interface SlotComponent {
  id?: string;
  name?: string;
  partNumber?: string;
  quantity?: number;
  qty?: number;
  batch?: string;
  batchNumber?: string;
  alert?: boolean;
}

interface SlotData {
  id: string;
  component?: SlotComponent | null;
  alert?: boolean;
}

interface CabinetRow {
  id: string;
  label?: string;
  slots?: SlotData[];
}

interface Cabinet {
  cols?: number;
  rows?: CabinetRow[];
}

interface CabinetSlotGridProps {
  cabinet?: Cabinet;
  selectedSlot?: string | null;
  onSelectSlot?: (slotId: string) => void;
}

export function CabinetSlotGrid({
  cabinet,
  selectedSlot: controlledSelectedSlot,
  onSelectSlot,
}: CabinetSlotGridProps) {
  const [internalSelected, setInternalSelected] = useState<string>("A2");
  const activeSlotId = controlledSelectedSlot ?? internalSelected;

  const cols = cabinet?.cols || 4;
  const rawRows = cabinet?.rows || [
    { id: "A", label: "ROW-A" },
    { id: "B", label: "ROW-B" },
  ];

  const handleSelect = (slotId: string) => {
    setInternalSelected(slotId);
    if (onSelectSlot) onSelectSlot(slotId);
  };

  const normalizeId = (id?: string) => (id ? id.replace(/^ROW-/, "").trim() : "");
  const cleanActiveId = normalizeId(activeSlotId);

  let selectedSlotData: SlotData | null = null;
  let selectedComponent: SlotComponent | null = null;

  for (const r of rawRows) {
    if (Array.isArray(r.slots)) {
      const match = r.slots.find(
        (s) => normalizeId(s.id) === cleanActiveId || s.id === activeSlotId
      );
      if (match) {
        selectedSlotData = match;
        selectedComponent = match.component ?? null;
        break;
      }
    }
  }

  const isSlotAlert = Boolean(selectedSlotData?.alert || selectedComponent?.alert);

  return (
    <div className="w-full max-w-md select-none font-sans text-white">
      <div className="mb-3 text-[11px] font-bold tracking-widest text-[#a855f7]/80 uppercase">
        Slot Grid
      </div>

      {/* Main Grid Card */}
      <div className="rounded-3xl border border-purple-900/40 bg-[#160628]/90 p-5 shadow-2xl backdrop-blur-xl">
        {/* Column Numbers Header */}
        <div className="mb-3 flex items-center">
          <div className="w-16" />
          <div className="grid flex-1 grid-cols-4 gap-3 text-center text-xs font-semibold text-purple-300/70">
            {Array.from({ length: cols }, (_, i) => (
              <span key={i + 1}>{i + 1}</span>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-3">
          {rawRows.map((rowItem, rIdx) => {
            const rawId = typeof rowItem === "object" ? rowItem.id : rowItem;
            const letter = String(rawId).replace(/^ROW-/, "");
            const rowLabel = `ROW-${letter}`;

            return (
              <div key={rowLabel} className="flex items-center">
                <span className="w-16 text-xs font-semibold tracking-wider text-purple-300/80">
                  {rowLabel}
                </span>

                <div className="grid flex-1 grid-cols-4 gap-3">
                  {Array.from({ length: cols }, (_, colIndex) => {
                    const colNum = colIndex + 1;
                    const standardSlotId = `${letter}${colNum}`;
                    const displaySlotId = `ROW-${standardSlotId}`;

                    const slotData = rowItem.slots?.find(
                      (s) => normalizeId(s.id) === standardSlotId
                    );

                    const component = slotData?.component;
                    const isOccupied = Boolean(component);
                    const isSelected = cleanActiveId === standardSlotId;
                    const hasAlert = Boolean(slotData?.alert || component?.alert);

                    return (
                      <button
                        key={standardSlotId}
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

      {/* Dynamic Slot Detail Card */}
      <div className="mt-4 rounded-3xl border border-purple-900/30 bg-[#160628]/90 p-4 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-white">
            Slot {activeSlotId.startsWith("ROW-") ? activeSlotId : `ROW-${activeSlotId}`}
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

        <div className="mt-3 flex items-center justify-between border-t border-purple-900/30 pt-3 text-xs text-purple-200/70">
          {selectedComponent ? (
            <>
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
            </>
          ) : (
            <div className="text-purple-300/50 italic">No component assigned to this slot.</div>
          )}
        </div>
      </div>
    </div>
  );
}