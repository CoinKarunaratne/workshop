// src/app/(app)/customers/page.tsx
import { CustomersHeader } from "@/components/app/customers/customers-header";
import { CustomersTable } from "@/components/app/customers/customers-table";

export default function CustomersPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <CustomersHeader />
      <CustomersTable />
    </div>
  );
}

