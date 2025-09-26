// src/lib/dummy-items.ts
import { nanoid } from "nanoid";

export type ItemType = "part" | "labour" | "misc";

export interface StockItem {
  id: string;
  sku?: string;
  name: string;
  type: ItemType;         // "part" = inventory, "labour" = service
  unit?: string;          // "ea", "hr"
  sellPrice: number;      // default price (editable on lines)
  taxRate?: number;       // %, e.g. 15
  // inventory-only
  onHand?: number;
  reorderLevel?: number;
  buyPrice?: number;
  supplier?: string;

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const ITEMS: StockItem[] = [
  {
    id: nanoid(),
    sku: "LAB-GEN",
    name: "General labour (per hour)",
    type: "labour",
    unit: "hr",
    sellPrice: 95,
    taxRate: 15,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: nanoid(),
    sku: "BRK-COR14",
    name: "Brake pads — Corolla 2014",
    type: "part",
    unit: "ea",
    sellPrice: 120,
    buyPrice: 68,
    taxRate: 15,
    onHand: 8,
    reorderLevel: 2,
    supplier: "Autoparts NZ",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: nanoid(),
    sku: "OIL-5W30",
    name: "Engine oil 5W-30 (1L)",
    type: "part",
    unit: "L",
    sellPrice: 22.5,
    buyPrice: 12,
    taxRate: 15,
    onHand: 24,
    reorderLevel: 6,
    supplier: "LubeCo",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function upsertItem(item: StockItem) {
  const idx = ITEMS.findIndex((i) => i.id === item.id);
  if (idx === -1) ITEMS.push(item);
  else ITEMS[idx] = item;
}

export function deleteItem(id: string) {
  const idx = ITEMS.findIndex((i) => i.id === id);
  if (idx !== -1) ITEMS.splice(idx, 1);
}

export function createBlankItem(type: ItemType = "part"): StockItem {
  const now = new Date().toISOString();
  return {
    id: nanoid(),
    name: "",
    type,
    unit: type === "labour" ? "hr" : "ea",
    sellPrice: 0,
    taxRate: 15,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
}
