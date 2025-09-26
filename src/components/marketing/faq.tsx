// src/components/marketing/faq.tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Do I need a credit card for the trial?", a: "No. Start free and add billing if you continue." },
  { q: "Can I import from my current tool?", a: "Yes, CSV import for customers, vehicles, and jobs." },
  { q: "Does it work on mobile?", a: "Yes. The UI is responsive and touch friendly." },
  { q: "Where is my data stored?", a: "Securely hosted and backed by Postgres. You control your data." },
];

export function FAQ() {
  return (
    <section id="faq">
      <div className="container mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold tracking-tight">FAQ</h2>
        <Accordion type="single" collapsible className="mt-8">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
