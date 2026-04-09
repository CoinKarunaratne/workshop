"use client";

import * as React from "react";
import Link from "next/link";
import { useReactToPrint } from "react-to-print";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { InvoiceTemplate } from "@/components/app/invoices/invoice-template";
import { calcBankCharge, calcTotals, type Invoice } from "@/lib/dummy-invoices";
import { getCustomer } from "@/lib/data/customers.db";
import type { Customer, Vehicle } from "@/lib/types";
import { getJob, type JobRecord } from "@/lib/data/jobs.db";

type Props = {
  invoice: Invoice;
  job?: JobRecord | null;
  customer?: Customer | null;
  vehicle?: Vehicle | null;
  company?: {
    name: string;
    lines?: string[];
    phone?: string;
    email?: string;
  };
  currencySymbol?: string;
  showEditLink?: boolean;
  variant?: "plain" | "branded";
};

const DEFAULT_COMPANY = {
  name: "Your Garage Name",
  lines: ["123 Workshop Rd, Auckland", "New Zealand"],
  phone: "+64 21 000 000",
  email: "info@garage.co.nz",
} satisfies NonNullable<Props["company"]>;

export function InvoicePrintView({
  invoice,
  job: jobProp,
  customer: customerProp,
  vehicle: _vehicleProp,
  company,
  currencySymbol = "$",
  showEditLink = true,
  variant = "branded",
}: Props) {
  void _vehicleProp;
  const companySafe = company ?? DEFAULT_COMPANY;

  const [job, setJob] = React.useState<JobRecord | null>(jobProp ?? null);
  const [customer, setCustomer] = React.useState<Customer | null>(customerProp ?? null);

  React.useEffect(() => {
    if (jobProp !== undefined || customerProp !== undefined) return;
    (async () => {
      const j = await getJob(invoice.jobId).catch(() => null);
      setJob(j);
      if (j?.customerId) setCustomer(await getCustomer(j.customerId).catch(() => null));
    })();
  }, [invoice.jobId, jobProp, customerProp]);

  const printRef = React.useRef<HTMLDivElement | null>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: invoice.invoiceNumber || "Invoice",
  });

  const jobNo = job?.jobNumber ?? invoice.jobId.slice(0, 6).toUpperCase();
  const rego = invoice.rego || job?.vehicleRego || "—";
  const mileage = invoice.mileage?.trim() ? invoice.mileage.trim() : "—";

  const { subtotal, taxTotal, total } = calcTotals(invoice.lines, invoice.gstEnabled);
  const bankCharge = calcBankCharge(total, !!invoice.bankChargeEnabled);
  const grandTotal = Number((total + bankCharge).toFixed(2));

  const lines = invoice.lines.map((l) => {
    const qty = Number(l.quantity) || 0;
    const unit = Number(l.unitPrice) || 0;
    const amount = typeof l.overrideTotal === "number" ? Number(l.overrideTotal) : qty * unit;
    return { id: l.id, description: l.description, quantity: qty, unitPrice: unit, amount };
  });

  return (
    <div className="space-y-4 print:space-y-0">
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 0; }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            box-sizing: border-box;
          }
        }
      `}</style>
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div className="text-sm text-muted-foreground">
          Invoice <span className="font-medium text-foreground">{invoice.invoiceNumber}</span>
          <span> · Job {jobNo}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Download className="mr-2 h-4 w-4" />
            Download / Print
          </Button>
          {showEditLink ? (
            <Button asChild>
              <Link href={`/app/jobs/${invoice.jobId}/invoice`}>Edit</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <Separator className="print:hidden" />

      <div ref={printRef}>
        <InvoiceTemplate
          title="Invoice"
          variant={variant}
          company={companySafe}
          billTo={
            customer
              ? {
                  name: customer.name,
                  lines: [
                    customer.phone ? `Phone: ${customer.phone}` : "",
                    customer.email ? `Email: ${customer.email}` : "",
                    customer.address ? customer.address : "",
                    rego !== "—" ? `Rego: ${rego}` : "",
                    job?.vehicleRego && job.vehicleRego !== rego ? `Alt rego: ${job.vehicleRego}` : "",
                  ].filter(Boolean),
                }
              : undefined
          }
          headerBlocks={{
            leftTitle: "Invoice to:",
            middleTitle: "",
            rightTitle: "",
            middle: [
              { label: "Rego:", value: rego },
              { label: "Mileage:", value: mileage },
            ],
            right: [
              { label: "Invoice No:", value: invoice.invoiceNumber },
              { label: "Date:", value: new Date(invoice.date).toLocaleDateString("en-NZ") },
            ],
          }}
          lines={lines}
          currencySymbol={currencySymbol}
          totals={{
            subtotalLabel: "SUB TOTAL",
            subtotal: Number(subtotal.toFixed(2)),
            taxLabel: "GST",
            taxTotal: invoice.gstEnabled ? Number(taxTotal.toFixed(2)) : undefined,
            extraRows: invoice.bankChargeEnabled
              ? [{ label: "Bank charge", value: Number(bankCharge.toFixed(2)) }]
              : undefined,
            totalLabel: "GRAND TOTAL",
            total: Number(grandTotal.toFixed(2)),
          }}
          payment={{
            title: "Payment Method :",
            rows: [
              { label: "Account No", value: "—" },
              { label: "Account Name", value: companySafe.name },
              { label: "Payment Reference", value: invoice.invoiceNumber },
            ],
          }}
          contact={
            variant === "branded"
              ? [
                  { label: "Web", value: "—" },
                  { label: "Email", value: companySafe.email ?? "—" },
                  { label: "Phone", value: companySafe.phone ?? "—" },
                ]
              : undefined
          }
          footerNote={
            invoice.notesBottom ? (
              <span className="whitespace-pre-wrap">{invoice.notesBottom}</span>
            ) : (
              "Thanks for your business with us!"
            )
          }
        />
      </div>
    </div>
  );
}

