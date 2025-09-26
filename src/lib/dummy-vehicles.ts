// src/lib/dummy-vehicles.ts
export type VehicleRow = {
    id: string;
    customerId: string;
    rego: string;
    make?: string;
    model?: string;
    year?: string;
    lastService?: string; // ISO
  };
  
  export const VEHICLES: VehicleRow[] = [
    { id: "vh_2001", customerId: "cst_1001", rego: "ABC123", make: "Toyota", model: "Corolla", year: "2014", lastService: new Date(Date.now() - 86_400_000 * 60).toISOString() },
    { id: "vh_2002", customerId: "cst_1001", rego: "XYZ987", make: "Ford", model: "Ranger",  year: "2019", lastService: new Date(Date.now() - 86_400_000 * 200).toISOString() },
    { id: "vh_2003", customerId: "cst_1003", rego: "KLM456", make: "Honda", model: "Civic",   year: "2018", lastService: new Date(Date.now() - 86_400_000 * 15).toISOString() },
  ];
  