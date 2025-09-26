// src/app/(app)/vehicles/page.tsx
import { VehiclesHeader } from "@/components/app/vehicles/vehicles-header";
export default function VehiclesPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <VehiclesHeader />
      {/* vehicles table/cards go here */}
    </div>
  );
}
