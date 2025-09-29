"use client";

import { VEHICLES } from "../dummy-vehicles";
import { VehicleRow } from "../dummy-vehicles";

export async function listVehicles(): Promise<VehicleRow[]> {
  return VEHICLES;
}

export async function getVehicle(id: string): Promise<VehicleRow | null> {
  return VEHICLES.find((v) => v.id === id) ?? null;
}

export async function repoDeleteVehicles(ids: string[]): Promise<void> {
  console.log("Delete vehicles (demo):", ids);
}

export async function repoUpdateVehicle(id: string, data: Partial<VehicleRow>): Promise<VehicleRow | null> {
  console.log("Update vehicle (demo):", id, data);
  return VEHICLES.find((v) => v.id === id) ?? null;
}
