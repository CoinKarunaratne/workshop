"use client";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { VehicleForm } from "@/components/app/vehicles/vehicle-form";
import { getCustomer } from "@/lib/data/customers.db";
import { toast } from "sonner";

export default function NewVehicleForCustomerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const customerId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [cust, setCust] = React.useState<{ id: string; name: string } | null>(null);

  React.useEffect(() => {
    (async () => {
      const c = await getCustomer(customerId);
      if (!c) {
        toast.error("Customer not found");
        router.push("/app/customers");
        return;
      }
      setCust({ id: c.id, name: c.name ?? "" });
    })();
  }, [customerId, router]);

  if (!cust) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;

  return (
    <VehicleForm
      mode="create"
      lockedCustomer={cust}
      onCreated={() => router.push(`/app/customers/${cust.id}`)}
    />
  );
}
