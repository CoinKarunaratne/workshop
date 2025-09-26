// src/components/marketing/how-it-works.tsx
export function HowItWorks() {
    const steps = [
      { n: "01", t: "Create a job", d: "Enter vehicle rego & concerns. We’ll draft the job details for you." },
      { n: "02", t: "Do the work", d: "Technicians update statuses; customers auto‑notified at key moments." },
      { n: "03", t: "Invoice smarter", d: "Accept AI‑suggested lines, send, and get paid." },
    ];
    return (
      <section id="how" className="border-b">
        <div className="container mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-center text-3xl font-bold tracking-tight">From intake to invoice</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {steps.map(s => (
              <div key={s.n} className="rounded-lg border p-6">
                <span className="text-xs font-medium text-primary">{s.n}</span>
                <h3 className="mt-2 text-lg font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  