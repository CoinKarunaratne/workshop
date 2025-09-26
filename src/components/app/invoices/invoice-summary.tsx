"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

type Props = {
  jobId: string;
  invoice: {
    invoiceNumber: string;
    status?: "draft" | "sent" | "paid" | "void";
    date: string;          // ISO YYYY-MM-DD
    subtotal: number;
    taxTotal: number;
    total: number;
  } | null;
};

export function InvoiceSummary({ jobId, invoice }: Props) {
  if (!invoice) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoice</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">No invoice yet for this job.</p>
          <Button asChild><Link href={`/app/jobs/${jobId}/invoice`}>Create Invoice</Link></Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Invoice</CardTitle>
        {invoice.status && <Badge variant="secondary" className="capitalize">{invoice.status}</Badge>}
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Number</span>
          <span className="font-medium">{invoice.invoiceNumber}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Date</span>
          <span>{new Date(invoice.date).toLocaleDateString("en-NZ")}</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${invoice.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">GST</span>
          <span>${invoice.taxTotal.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-base font-medium">
          <span>Total</span>
          <span>${invoice.total.toFixed(2)}</span>
        </div>

        <div className="pt-2">
          <Button asChild variant="outline" className="mr-2">
            <Link href={`/app/jobs/${jobId}/invoice`}>Edit</Link>
          </Button>
          <Button asChild>
            <Link href={`/app/jobs/${jobId}/invoice`}>View / Print</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
