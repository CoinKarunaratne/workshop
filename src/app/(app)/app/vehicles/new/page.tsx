"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { VehicleForm, VehicleDraft } from "@/components/app/vehicles/vehicle-form";

export default function NewVehiclePage() {
  const router = useRouter();
  return (
    <div className="app-page">
      <div className="app-container">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">New Vehicle</h1>
        </div>
        <VehicleForm
          mode="new"
          onSubmit={async (data: VehicleDraft) => {
            console.log("Create vehicle (demo):", data);
            toast.success("Vehicle created (demo)");
            router.push("/app/vehicles");
          }}
        />
      </div>
    </div>
  );
}
