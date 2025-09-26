"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

type Props = {
  jobId: string;
  quote: {
    number: string;
    status: "draft" | "sent" | "accepted" | "declined";
    date: string;         // ISO YYYY-MM-DD
    subtotal: number;
    taxTotal: number;
    total: number;
  } | null;
};

export function QuotationSummary({ jobId, quote }: Props) {
  if (!quote) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quotation</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">No quotation yet for this job.</p>
          <Button asChild>
            <Link href={`/app/jobs/${jobId}/quotation`}>Create Quotation</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Quotation</CardTitle>
        <Badge variant="secondary" className="capitalize">{quote.status}</Badge>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Number</span>
          <span className="font-medium">{quote.number}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Date</span>
          <span>{new Date(quote.date).toLocaleDateString("en-NZ")}</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${quote.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">GST</span>
          <span>${quote.taxTotal.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-base font-medium">
          <span>Total</span>
          <span>${quote.total.toFixed(2)}</span>
        </div>

        <div className="pt-2">
          <Button asChild variant="outline" className="mr-2">
            <Link href={`/app/jobs/${jobId}/quotation`}>Edit Quotation</Link>
          </Button>
          <Button asChild>
            <Link href={`/app/jobs/${jobId}/quotation`}>View / Print</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
