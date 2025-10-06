"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { VehicleForm, VehicleDraft } from "@/components/app/vehicles/vehicle-form";
import { getVehicle, updateVehicle } from "@/lib/data/vehicles.db";
import { toast } from "sonner";

export default function EditVehiclePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [loading, setLoading] = React.useState(true);
  const [vehicle, setVehicle] = React.useState<any | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const v = await getVehicle(id);
        if (!v) {
          toast.error("Vehicle not found");
          router.push("/app/vehicles");
          return;
        }
        setVehicle(v);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load vehicle");
        router.push("/app/vehicles");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  async function onSubmit(updates: VehicleDraft) {
    try {
      await updateVehicle(id, {
        ownerName: updates.ownerName ?? vehicle.ownerName,
        rego: updates.rego ?? vehicle.rego,
        make: updates.make ?? vehicle.make,
        model: updates.model ?? vehicle.model,
        year: updates.year ?? vehicle.year,
        mileage: updates.mileage ?? vehicle.mileage,
        wofExpiry: updates.wofExpiry ?? vehicle.wofExpiry,
        serviceDue: updates.serviceDue ?? vehicle.serviceDue,
      });
      toast.success("Vehicle updated");
      router.push("/app/vehicles");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to update vehicle");
    }
  }

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  if (!vehicle) return null;

  return <VehicleForm mode="edit" initialData={vehicle} onSubmit={onSubmit} />;
}
