"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { VehicleForm, VehicleDraft } from "@/components/app/vehicles/vehicle-form";
import { getVehicle, repoUpdateVehicle } from "@/lib/data/vehicles.client";

export default function EditVehiclePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const v = await getVehicle(id);
      if (!v) {
        toast.error("Vehicle not found");
        router.push("/app/vehicles");
      } else {
        setVehicle(v); // has ownerName/customerId from dummy file
      }
    })();
  }, [id, router]);

  if (!vehicle) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="app-page">
      <div className="app-container">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Edit Vehicle</h1>
        </div>
        <VehicleForm
          mode="edit"
          initialData={vehicle}
          onSubmit={async (updates: VehicleDraft) => {
            await repoUpdateVehicle(vehicle.id, updates);
            toast.success("Vehicle updated (demo)");
            router.push("/app/vehicles");
          }}
        />
      </div>
    </div>
  );
}
