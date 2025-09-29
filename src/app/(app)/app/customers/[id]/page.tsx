// src/app/(app)/customers/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { CUSTOMERS } from "@/lib/dummy-customers";
import { VEHICLES } from "@/lib/dummy-vehicles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Wrench, Car } from "lucide-react";

type SearchDict = Record<string, string | string[] | undefined>;
type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<SearchDict>;
};

// fixed-locale date helper to avoid hydration diffs
const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("en-NZ") : "—");

export default async function CustomerDetailPage({ params, searchParams }: Props) {
  // ✅ await dynamic APIs
  const { id } = await params;
  const sp = (await searchParams) ?? {};

  // read ?tab=... once (initial render)
  const rawTab = sp.tab;
  const tabParam = Array.isArray(rawTab) ? rawTab[0] : rawTab;
  const tab = (tabParam ?? "overview") as "overview" | "vehicles" | "jobs";

  const customer = CUSTOMERS.find((c) => c.id === id);
  if (!customer) return notFound();

  const vehicles = VEHICLES.filter((v) => v.customerId === customer.id);

  const lastVisitStr = fmtDate(customer.lastVisit);
  const balanceBadge =
    customer.balance > 0.001 ? (
      <Badge variant="destructive">${customer.balance.toFixed(2)} due</Badge>
    ) : (
      <Badge variant="secondary">No balance</Badge>
    );

  return (
    <div className="app-page">
      <div className="app-container">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">{customer.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>Last visit: {lastVisitStr}</span>
              <span>•</span>
              <span>{customer.email || "No email"}</span>
              <span>•</span>
              <span>{customer.phone || "No phone"}</span>
              <span>•</span>
              {balanceBadge}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href={`/app/customers/${customer.id}/vehicles/new`}>
                <Car className="mr-2 size-4" /> Add vehicle
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/app/jobs/new?customer=${encodeURIComponent(customer.name)}`}>
                <Wrench className="mr-2 size-4" /> New job
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue={tab} className="w-full">
          <TabsList className="px-1 sm:px-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="mt-4">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Info label="Email" value={customer.email || "—"} />
                  <Info label="Phone" value={customer.phone || "—"} />
                  <Info label="Vehicles" value={String(vehicles.length)} />
                </div>
                <Separator className="my-4" />
                <div className="text-sm text-muted-foreground">
                  Keep notes, preferences, and account summary here (future).
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vehicles */}
          <TabsContent value="vehicles" className="mt-4">
            <Card>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between p-4 sm:p-5">
                  <div className="font-medium">Vehicles</div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/app/customers/${customer.id}/vehicles/new`}>
                      <Plus className="mr-2 size-4" /> Add vehicle
                    </Link>
                  </Button>
                </div>
                <Separator />
                {vehicles.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rego</TableHead>
                        <TableHead>Make/Model</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Last service</TableHead>
                        <TableHead className="text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicles.map((v) => (
                        <TableRow key={v.id}>
                          <TableCell className="font-medium">{v.rego}</TableCell>
                          <TableCell>{[v.make, v.model].filter(Boolean).join(" ") || "—"}</TableCell>
                          <TableCell>{v.year || "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{fmtDate(v.lastService)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                href={`/app/jobs/new?customer=${encodeURIComponent(
                                  customer.name
                                )}&rego=${encodeURIComponent(v.rego)}`}
                              >
                                <Wrench className="mr-2 size-4" /> New job
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-6 text-sm text-muted-foreground">
                    No vehicles yet. Add the first one for {customer.name}.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs (placeholder for now) */}
          <TabsContent value="jobs" className="mt-4">
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                We’ll show this customer’s job history here (list + filters).
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
