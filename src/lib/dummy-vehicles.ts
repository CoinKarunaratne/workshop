import { Vehicle } from "./types";

export type VehicleRow = Vehicle;

export const VEHICLES: VehicleRow[] = [
  {
    id: "vh_2001",
    customerId: "cst_1001",
    ownerName: "Jane Doe",
    rego: "ABC123",
    make: "Toyota",
    model: "Corolla",
    year: "2014",
    lastService: new Date(Date.now() - 86_400_000 * 60).toISOString(),
    mileage: "145000",
    wofExpiry: new Date(Date.now() + 86_400_000 * 30).toISOString(),
    serviceDue: new Date(Date.now() + 86_400_000 * 90).toISOString(),
  },
  {
    id: "vh_2002",
    customerId: "cst_1001",
    ownerName: "Jane Doe",
    rego: "XYZ987",
    make: "Ford",
    model: "Ranger",
    year: "2019",
    lastService: new Date(Date.now() - 86_400_000 * 200).toISOString(),
    mileage: "75000",
    wofExpiry: new Date(Date.now() - 86_400_000 * 10).toISOString(), // expired
    serviceDue: new Date(Date.now() + 86_400_000 * 45).toISOString(),
  },
  {
    id: "vh_2003",
    customerId: "cst_1003",
    ownerName: "Bob Smith",
    rego: "KLM456",
    make: "Honda",
    model: "Civic",
    year: "2018",
    lastService: new Date(Date.now() - 86_400_000 * 15).toISOString(),
    mileage: "60000",
    wofExpiry: new Date(Date.now() + 86_400_000 * 120).toISOString(),
    serviceDue: new Date(Date.now() + 86_400_000 * 30).toISOString(),
  },
];
