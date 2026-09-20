import Link from "next/link"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/form-controls"
import { isOpsAuthenticated } from "@/lib/auth/ops-session"
import { listSupplierApplications } from "@/lib/supplier/repository"
import { getSupplierStatusPresentation } from "@/lib/supplier/presentation"
import type { SupplierStatus } from "@/lib/supplier/lifecycle"
import { opsLoginAction, opsLogoutAction } from "./actions"

export default async function OpsSuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const authed = await isOpsAuthenticated()
  const { error } = await searchParams

  if (!authed) {
    return (
      <div className="mx-auto max-w-md p-8">
        <h1 className="font-display text-3xl">Supplier ops</h1>
        <p className="mt-2 text-sm text-muted">
          Interim gate using SUPPLIER_ADMIN_API_KEY (ADR-0012). Not a staff identity system.
        </p>
        {error === "unauthorized" ? (
          <Alert title="Unauthorised" tone="danger" className="mt-4">
            Invalid key.
          </Alert>
        ) : null}
        <form action={opsLoginAction} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold">
            Admin API key
            <Input name="apiKey" type="password" required autoComplete="off" />
          </label>
          <Button type="submit" className="w-full">
            Enter
          </Button>
        </form>
      </div>
    )
  }

  const rows = await listSupplierApplications({ limit: 100 })

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Supplier applications</h1>
          <p className="mt-1 text-sm text-muted">Staff review surface (Gate ZB-05).</p>
        </div>
        <form action={opsLogoutAction}>
          <Button type="submit" variant="secondary">
            Sign out
          </Button>
        </form>
      </div>
      <ul className="space-y-3">
        {rows.map((row) => {
          const status = getSupplierStatusPresentation(row.status as SupplierStatus)
          return (
            <li key={row.id}>
              <Card className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold">{row.legalName}</p>
                    <p className="text-sm text-muted">
                      {row.countryCode} · {status.label} · ERP {row.erpProjectionStatus}
                    </p>
                  </div>
                  <Link className="text-sm font-semibold underline" href={`/ops/suppliers/${row.id}`}>
                    Open
                  </Link>
                </div>
              </Card>
            </li>
          )
        })}
      </ul>
      {rows.length === 0 ? <p className="text-muted">No applications yet.</p> : null}
    </div>
  )
}
