import * as React from "react";

export type InvoiceTemplateParty = {
  name: string;
  lines?: string[];
};

export type InvoiceTemplateMetaRow = {
  label: string;
  value: React.ReactNode;
};

export type InvoiceTemplateLine = {
  id: string;
  description: React.ReactNode;
  quantity?: number;
  unitPrice?: number;
  amount: number;
};

type Props = {
  title?: string; // default "INVOICE"
  variant?: "plain" | "branded";

  company: InvoiceTemplateParty & { email?: string; phone?: string };
  billTo?: InvoiceTemplateParty;

  /** Header blocks (matches your sample invoice layout) */
  headerBlocks?: {
    leftTitle?: string;
    middleTitle?: string;
    rightTitle?: string;
    middle?: InvoiceTemplateMetaRow[];
    right?: InvoiceTemplateMetaRow[];
  };

  lines: InvoiceTemplateLine[];

  currencySymbol?: string;
  totals?: {
    subtotalLabel?: string;
    subtotal: number;
    taxLabel?: string;
    taxTotal?: number;
    extraRows?: Array<{ label: string; value: number }>;
    totalLabel?: string;
    total: number;
  };

  payment?: {
    title?: string;
    rows: Array<{ label: string; value: React.ReactNode }>;
  };

  footerNote?: React.ReactNode;

  /** Optional logo (used by branded variant) */
  logo?: React.ReactNode;

  /** Optional contact strip (used by branded variant) */
  contact?: Array<{ label: string; value: React.ReactNode }>;
};

function money(n: number, currencySymbol: string) {
  const safe = Number.isFinite(n) ? n : 0;
  return `${currencySymbol}${safe.toFixed(2)}`;
}

function Hr() {
  return <div className='h-px w-full bg-black/20' />;
}

function MetaGrid({ rows }: { rows: InvoiceTemplateMetaRow[] }) {
  return (
    <div className='space-y-1 text-sm'>
      {rows.map((r) => (
        <div key={r.label} className='grid grid-cols-[110px_1fr] gap-2'>
          <div className='text-black/70'>{r.label}</div>
          <div className='text-right font-medium'>{r.value}</div>
        </div>
      ))}
    </div>
  );
}

export function InvoiceTemplate({
  title = "INVOICE",
  variant = "plain",
  company,
  billTo,
  headerBlocks,
  lines,
  currencySymbol = "$",
  totals,
  payment,
  footerNote,
  logo,
  contact,
}: Props) {
  const hasQty = lines.some((l) => typeof l.quantity === "number");
  const hasUnit = lines.some((l) => typeof l.unitPrice === "number");

  return (
    <div className='relative bg-white text-black print:bg-white print:text-black'>
      {variant === "branded" ? (
        <>
          {/* Decorative bands (print-safe, no external assets) */}
          <div className='pointer-events-none absolute inset-x-0 top-0 h-28 overflow-hidden'>
            <svg
              viewBox='0 0 1200 180'
              className='h-full w-full'
              preserveAspectRatio='none'
              aria-hidden='true'
            >
              <path
                d='M0,0 L300,0 L130,160 L0,160 Z'
                fill='#b91c1c'
                opacity='0.95'
              />
              <path
                d='M0,0 L230,0 L95,140 L0,140 Z'
                fill='#ef4444'
                opacity='0.9'
              />
              <path
                d='M260,0 C520,110 820,110 1200,20 L1200,0 Z'
                fill='#e5e7eb'
                opacity='0.9'
              />
            </svg>
          </div>
          <div className='pointer-events-none absolute inset-x-0 bottom-0 h-28 overflow-hidden'>
            <svg
              viewBox='0 0 1200 180'
              className='h-full w-full'
              preserveAspectRatio='none'
              aria-hidden='true'
            >
              <path
                d='M0,120 C250,40 520,200 820,120 C980,80 1090,80 1200,120 L1200,180 L0,180 Z'
                fill='#b91c1c'
                opacity='0.95'
              />
              <path
                d='M0,140 C300,80 520,210 830,140 C1010,100 1120,100 1200,140 L1200,180 L0,180 Z'
                fill='#ef4444'
                opacity='0.85'
              />
            </svg>
          </div>
        </>
      ) : null}

      <div
        className={
          variant === "branded"
            ? "relative mx-auto w-[210mm] min-h-[297mm] px-[14mm] pb-[16mm] pt-[14mm] print:w-[210mm] print:min-h-[297mm]"
            : "relative mx-auto w-[210mm] min-h-[297mm] px-[14mm] pb-[16mm] pt-[14mm] print:w-[210mm] print:min-h-[297mm]"
        }
      >
        <div className='flex items-start justify-between gap-6'>
          <div className='min-w-0'>
            <div className='text-lg font-semibold'>Kiwi Auto</div>
            <div className='mt-1 space-y-0.5 text-xs text-black/70'>
              {company.lines?.map((x, i) => (
                <div key={i}>{x}</div>
              ))}
              {company.email ? <div>{company.email}</div> : null}
              {company.phone ? <div>{company.phone}</div> : null}
            </div>
          </div>
          <div className='text-right'>
            {variant === "branded" && logo ? (
              <div className='mb-1 flex justify-end'>
                <div className='h-10 max-w-[220px]'>{logo}</div>
              </div>
            ) : null}
            <div
              className={
                variant === "branded"
                  ? "text-2xl font-semibold tracking-wide text-red-700"
                  : "text-xl font-semibold tracking-wide"
              }
            >
              {title}
            </div>
          </div>
        </div>

        {variant === "branded" && contact?.length ? (
          <div className='mt-4 grid grid-cols-3 gap-3 text-xs text-black/70'>
            {contact.slice(0, 3).map((c) => (
              <div key={c.label} className='flex items-center gap-2'>
                <span className='font-semibold'>{c.label}</span>
                <span>{c.value}</span>
              </div>
            ))}
          </div>
        ) : null}

        <div className={variant === "branded" ? "my-4" : "my-3"}>
          <Hr />
        </div>

        <div className='grid gap-4 md:grid-cols-3'>
          <div className='space-y-1'>
            <div className='text-xs font-semibold'>
              {headerBlocks?.leftTitle ?? "Invoice to:"}
            </div>
            {billTo ? (
              <div className='text-sm'>
                <div className='font-medium'>{billTo.name}</div>
                <div className='mt-1 space-y-0.5 text-xs text-black/70'>
                  {billTo.lines?.map((x, i) => (
                    <div key={i}>{x}</div>
                  ))}
                </div>
              </div>
            ) : (
              <div className='text-sm text-black/60'>—</div>
            )}
          </div>

          <div className='space-y-1'>
            <div className='text-xs font-semibold'>
              {headerBlocks?.middleTitle ?? ""}
            </div>
            {headerBlocks?.middle?.length ? (
              <MetaGrid rows={headerBlocks.middle} />
            ) : (
              <div />
            )}
          </div>

          <div className='space-y-1'>
            <div className='text-xs font-semibold'>
              {headerBlocks?.rightTitle ?? ""}
            </div>
            {headerBlocks?.right?.length ? (
              <MetaGrid rows={headerBlocks.right} />
            ) : (
              <div />
            )}
          </div>
        </div>

        <div className='my-3'>
          <Hr />
        </div>

        <div className='overflow-hidden'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-y border-black/20'>
                <th className='px-3 py-2 text-left text-xs font-semibold'>
                  DESCRIPTION
                </th>
                {hasQty ? (
                  <th className='px-3 py-2 text-right text-xs font-semibold'>
                    QTY
                  </th>
                ) : null}
                {hasUnit ? (
                  <th className='px-3 py-2 text-right text-xs font-semibold'>
                    PRICE
                  </th>
                ) : null}
                <th className='px-3 py-2 text-right text-xs font-semibold'>
                  TOTAL
                </th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr
                  key={l.id}
                  className='border-b border-black/10 last:border-b-0'
                >
                  <td className='px-3 py-2 align-top'>{l.description}</td>
                  {hasQty ? (
                    <td className='px-3 py-2 text-right tabular-nums'>
                      {typeof l.quantity === "number" ? l.quantity : ""}
                    </td>
                  ) : null}
                  {hasUnit ? (
                    <td className='px-3 py-2 text-right tabular-nums'>
                      {typeof l.unitPrice === "number"
                        ? money(l.unitPrice, currencySymbol)
                        : ""}
                    </td>
                  ) : null}
                  <td className='px-3 py-2 text-right tabular-nums'>
                    {money(l.amount, currencySymbol)}
                  </td>
                </tr>
              ))}

              {lines.length === 0 ? (
                <tr>
                  <td
                    className='px-3 py-10 text-center text-sm text-black/60'
                    colSpan={1 + (hasQty ? 1 : 0) + (hasUnit ? 1 : 0) + 1}
                  >
                    No line items.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className='mt-4 grid gap-4 md:grid-cols-2'>
          <div>
            {payment?.rows?.length ? (
              <div className='text-xs'>
                <div className='mb-2 font-semibold'>
                  {payment.title ?? "Payment method :"}
                </div>
                <div className='space-y-1'>
                  {payment.rows.map((r) => (
                    <div
                      key={r.label}
                      className='grid grid-cols-[140px_1fr] gap-2'
                    >
                      <div className='text-black/70'>{r.label}</div>
                      <div className='font-medium'>{r.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className='ml-auto w-full max-w-sm text-xs'>
            {totals ? (
              <div className='space-y-1 p-1'>
                <div className='flex items-center justify-between'>
                  <span className='font-semibold'>
                    {totals.subtotalLabel ?? "SUB TOTAL"}
                  </span>
                  <span className='tabular-nums'>
                    {money(totals.subtotal, currencySymbol)}
                  </span>
                </div>

                {typeof totals.taxTotal === "number" ? (
                  <div className='flex items-center justify-between'>
                    <span className='font-semibold'>
                      {totals.taxLabel ?? "GST"}
                    </span>
                    <span className='tabular-nums'>
                      {money(totals.taxTotal, currencySymbol)}
                    </span>
                  </div>
                ) : null}

                {totals.extraRows?.map((r) => (
                  <div
                    key={r.label}
                    className='flex items-center justify-between'
                  >
                    <span className='font-semibold'>{r.label}</span>
                    <span className='tabular-nums'>
                      {money(r.value, currencySymbol)}
                    </span>
                  </div>
                ))}

                <div className='my-2'>
                  <Hr />
                </div>

                <div className='flex items-center justify-between text-sm font-semibold'>
                  <span>{totals.totalLabel ?? "GRAND TOTAL"}</span>
                  <span className='tabular-nums'>
                    {money(totals.total, currencySymbol)}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {footerNote ? (
          <div className='mt-8 text-center text-sm font-medium'>
            {footerNote}
          </div>
        ) : null}
      </div>
    </div>
  );
}
