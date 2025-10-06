"use client";
import { useRouter } from "next/navigation";
import { VehicleForm } from "@/components/app/vehicles/vehicle-form";

export default function NewVehiclePage() {
  const router = useRouter();
  return (
    <VehicleForm
      mode="create"
      onCreated={() => router.push("/app/vehicles")}
    />
  );
}
