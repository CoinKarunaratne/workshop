import { VehiclesHeader } from "@/components/app/vehicles/vehicles-header";
import { VehiclesTable } from "@/components/app/vehicles/vehicles-table";

export default function VehiclesPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <VehiclesHeader />
      <VehiclesTable />
    </div>
  );
}
