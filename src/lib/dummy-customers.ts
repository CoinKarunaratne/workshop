// src/lib/dummy-customers.ts
export type CustomerRow = {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    vehicles: number;
    lastVisit: string; // ISO string
    balance: number;   // outstanding balance
  };
  
  export const CUSTOMERS: CustomerRow[] = [
    {
      id: "cst_1001",
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "+64 21 123 4567",
      vehicles: 2,
      lastVisit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      balance: 0,
    },
    {
      id: "cst_1002",
      name: "Jane Doe",
      email: "jane.doe@example.com",
      phone: "+64 27 555 1010",
      vehicles: 1,
      lastVisit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
      balance: 180.5,
    },
    {
      id: "cst_1003",
      name: "Bill Taylor",
      email: "bill.taylor@example.com",
      phone: "+64 22 321 7654",
      vehicles: 3,
      lastVisit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      balance: 0,
    },
    {
      id: "cst_1004",
      name: "Mia Chen",
      email: "mia.chen@example.com",
      phone: "+64 29 333 4444",
      vehicles: 1,
      lastVisit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString(),
      balance: 65.0,
    },
  ];
  