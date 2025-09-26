// src/lib/dummy.ts
export type JobStage = "Booked" | "In Workshop" | "Waiting Parts" | "Completed" | "Collected";

export const metrics = {
  jobsInProgress: 12,
  completedToday: 7,
  awaitingParts: 3,
  unpaidInvoices: 5,
  revenueWeek: 12450,
};

export const pipeline = [
  { stage: "Booked" as JobStage, count: 6 },
  { stage: "In Workshop" as JobStage, count: 12 },
  { stage: "Waiting Parts" as JobStage, count: 3 },
  { stage: "Completed" as JobStage, count: 4 },
  { stage: "Collected" as JobStage, count: 9 },
];

export const bookings = [
  { time: "8:30 AM", rego: "ABC123", customer: "John Smith", service: "WOF + Oil Change", status: "Booked" },
  { time: "10:00 AM", rego: "KLM998", customer: "S. Patel", service: "Brake Inspection", status: "Booked" },
  { time: "1:30 PM", rego: "QWE765", customer: "M. Chen", service: "Diagnosis", status: "Booked" },
];

export const recentActivity = [
  { when: "5m", text: "Invoice INV-219 sent to John Smith" },
  { when: "23m", text: "Job #1245 moved to Waiting Parts" },
  { when: "1h", text: "Payment received for INV-201 ($320.00)" },
  { when: "3h", text: "New customer added: RotorLab Auto" },
];

export const revenueSeries = [
  { day: "Mon", value: 1200 },
  { day: "Tue", value: 2050 },
  { day: "Wed", value: 1800 },
  { day: "Thu", value: 2400 },
  { day: "Fri", value: 3000 },
  { day: "Sat", value: 1800 },
  { day: "Sun", value: 1200 },
];

export const aiInsights = [
  "4 invoices overdue > 7 days. Consider sending reminders.",
  "Brake jobs up 18% this month. Stock low on pad set BP-320.",
  "3 cars ready for pickup since 2 PM. Send SMS updates?",
];
