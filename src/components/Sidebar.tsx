import Link from "next/link"

export function Sidebar() {
  const links = [
    { name: "Dashboard", href: "/app" },
    { name: "Jobs", href: "/app/jobs" },
    { name: "Customers", href: "/app/customers" },
    { name: "Vehicles", href: "/app/vehicles" },
    { name: "Invoices", href: "/app/invoices" },
  ]

  return (
    <aside className="h-full w-64 bg-blue-700 text-white flex flex-col">
      <div className="p-4 font-bold text-lg border-b border-blue-600">
        Workshop SaaS
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="block py-2 px-3 rounded hover:bg-blue-600"
          >
            {l.name}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
