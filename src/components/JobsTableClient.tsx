// src/components/JobsTableClient.tsx
"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Row = {
  id: string
  title?: string | null
  status?: string | null
  created_at?: string | null
  customer_name?: string | null
  vehicle_rego?: string | null
}

export default function JobsTableClient({ rows }: { rows: Row[] }) {
  const [isPending, startTransition] = useTransition()

  const handleQuickAction = (id: string, action: "start" | "complete" | "delete") => {
    startTransition(async () => {
      try {
        // TODO: call your action (Server Action / route handler) here
        // await fetch(`/api/jobs/${id}`, { method: "PATCH", body: JSON.stringify({ action }) })

        toast.success(`Job ${action === "delete" ? "deleted" : action + "ed"} successfully`)
      } catch {
        toast.error("Action failed")
      }
    })
  }

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">Created</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No jobs found
              </TableCell>
            </TableRow>
          ) : (
            rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}</TableCell>
                <TableCell className="font-medium">{r.title ?? "—"}</TableCell>
                <TableCell>{r.customer_name ?? "—"}</TableCell>
                <TableCell>{r.vehicle_rego ?? "—"}</TableCell>
                <TableCell>
                  <StatusBadge status={r.status ?? "Pending"} />
                </TableCell>
                <TableCell className="text-right">
                  <RowActions
                    onStart={() => handleQuickAction(r.id, "start")}
                    onComplete={() => handleQuickAction(r.id, "complete")}
                    onDelete={() => handleQuickAction(r.id, "delete")}
                    disabled={isPending}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase()
  if (s.includes("complete")) return <Badge className="bg-green-600 hover:bg-green-600">Completed</Badge>
  if (s.includes("progress")) return <Badge className="bg-blue-600 hover:bg-blue-600">In Progress</Badge>
  if (s.includes("hold")) return <Badge className="bg-yellow-500 hover:bg-yellow-500">On Hold</Badge>
  if (s.includes("cancel")) return <Badge variant="destructive">Canceled</Badge>
  return <Badge variant="secondary">Pending</Badge>
}

function RowActions({
  onStart,
  onComplete,
  onDelete,
  disabled,
}: {
  onStart: () => void
  onComplete: () => void
  onDelete: () => void
  disabled?: boolean
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={disabled} aria-label="Open actions">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onStart}>Start job</DropdownMenuItem>
        <DropdownMenuItem onClick={onComplete}>Mark complete</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600" onClick={onDelete}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
