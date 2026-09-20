import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input, Select } from "@/components/ui/form-controls"
import { isOpsAuthenticated } from "@/lib/auth/ops-session"
import { isErpProjectionConfigured } from "@/lib/erp/business-partner-client"
import { getSupplierApplicationById } from "@/lib/supplier/repository"
import { getSupplierStatusPresentation } from "@/lib/supplier/presentation"
import type { SupplierStatus } from "@/lib/supplier/lifecycle"
import {
  opsDocumentRefAction,
  opsErpProjectAction,
  opsErpReadyAction,
  opsTransitionAction,
  opsVerifyCapabilityAction,
  opsVerifyCertificationAction,
} from "../actions"

const NEXT: Partial<Record<SupplierStatus, SupplierStatus[]>> = {
  submitted: ["under_review"],
  under_review: ["more_information_required", "sample_required", "qualification", "rejected"],
  more_information_required: ["under_review"],
  sample_required: ["under_review"],
  qualification: ["approved", "rejected"],
  approved: ["active"],
  active: ["suspended", "offboarded"],
  suspended: ["active", "offboarded"],
}

export default async function OpsSupplierDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  if (!(await isOpsAuthenticated())) redirect("/ops/suppliers?error=unauthorized")

  const { id } = await params
  const { error } = await searchParams
  const detail = await getSupplierApplicationById(id)
  if (!detail) notFound()

  const status = detail.organisation.status as SupplierStatus
  const presentation = getSupplierStatusPresentation(status)
  const allowed = NEXT[status] ?? []
  const erpConfigured = isErpProjectionConfigured()
  const canProject =
    (detail.organisation.erpProjectionStatus === "READY" ||
      detail.organisation.erpProjectionStatus === "FAILED") &&
    Boolean(detail.organisation.canonicalOrganisationId)

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-8">
      <Link href="/ops/suppliers" className="text-sm font-semibold underline">
        ← All applications
      </Link>
      <h1 className="font-display text-3xl">{detail.organisation.legalName}</h1>
      <p className="text-muted">
        {presentation.label} · {detail.organisation.countryCode} · ERP{" "}
        {detail.organisation.erpProjectionStatus}
      </p>
      {error ? (
        <Alert title="Action failed" tone="danger">
          {error === "transition"
            ? "Illegal status transition."
            : error === "erp"
              ? "ERP READY only when approved or active; project only when READY."
              : error === "erp_config"
                ? "ERP client is not configured (BAOBAB_ERP_* env). Status unchanged."
                : error === "erp_canonical"
                  ? "Set canonical_organisation_id before projecting to ERP."
                  : error === "erp_project"
                    ? "ERP projection failed — status set to FAILED. Check ERP logs."
                    : error === "not_found"
                      ? "Capability or certification not found."
                      : "Invalid input."}
        </Alert>
      ) : null}

      <Card className="space-y-4 p-6">
        <h2 className="font-display text-xl">Transition status</h2>
        {allowed.length === 0 ? (
          <p className="text-sm text-muted">No staff transitions from this terminal/state.</p>
        ) : (
          <form action={opsTransitionAction} className="space-y-3">
            <input type="hidden" name="id" value={id} />
            <label className="block text-sm font-semibold">
              Next status
              <Select name="status" required defaultValue={allowed[0]}>
                {allowed.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block text-sm font-semibold">
              Actor label
              <Input name="actor" type="text" defaultValue="ops" required />
            </label>
            <label className="block text-sm font-semibold">
              Reason
              <Input name="reason" type="text" />
            </label>
            <Button type="submit">Apply transition</Button>
          </form>
        )}
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="font-display text-xl">Capabilities</h2>
        <ul className="space-y-4 text-sm">
          {detail.capabilities.map((c) => (
            <li key={c.id} className="rounded-control border border-line p-3">
              <p className="font-semibold">
                {c.productCategory} · {c.verificationStatus}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <form action={opsVerifyCapabilityAction}>
                  <input type="hidden" name="id" value={id} />
                  <input type="hidden" name="capabilityId" value={c.id} />
                  <input type="hidden" name="outcome" value="verified" />
                  <input type="hidden" name="actor" value="ops" />
                  <Button type="submit" size="sm" variant="secondary">
                    Verify
                  </Button>
                </form>
                <form action={opsVerifyCapabilityAction}>
                  <input type="hidden" name="id" value={id} />
                  <input type="hidden" name="capabilityId" value={c.id} />
                  <input type="hidden" name="outcome" value="rejected" />
                  <input type="hidden" name="actor" value="ops" />
                  <Button type="submit" size="sm" variant="danger">
                    Reject
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="font-display text-xl">Certifications</h2>
        {detail.certifications.length === 0 ? (
          <p className="text-sm text-muted">None declared.</p>
        ) : (
          <ul className="space-y-4 text-sm">
            {detail.certifications.map((c) => (
              <li key={c.id} className="rounded-control border border-line p-3">
                <p className="font-semibold">
                  {c.certificationType} · {c.verificationStatus}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <form action={opsVerifyCertificationAction}>
                    <input type="hidden" name="id" value={id} />
                    <input type="hidden" name="certificationId" value={c.id} />
                    <input type="hidden" name="outcome" value="verified" />
                    <input type="hidden" name="actor" value="ops" />
                    <Button type="submit" size="sm" variant="secondary">
                      Verify
                    </Button>
                  </form>
                  <form action={opsVerifyCertificationAction}>
                    <input type="hidden" name="id" value={id} />
                    <input type="hidden" name="certificationId" value={c.id} />
                    <input type="hidden" name="outcome" value="rejected" />
                    <input type="hidden" name="actor" value="ops" />
                    <Button type="submit" size="sm" variant="danger">
                      Reject
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="font-display text-xl">Document references (metadata only)</h2>
        <Alert title="No blob custody" tone="info">
          Record offline or external evidence pointers. Object storage is not integrated.
        </Alert>
        <ul className="space-y-2 text-sm">
          {detail.documents.map((d) => (
            <li key={d.id}>
              {d.kind}: {d.label}
              {d.externalReference ? ` — ${d.externalReference}` : ""}
            </li>
          ))}
        </ul>
        <form action={opsDocumentRefAction} className="space-y-3">
          <input type="hidden" name="id" value={id} />
          <Input name="kind" placeholder="kind e.g. cert" required />
          <Input name="label" placeholder="label" required />
          <Input name="externalReference" placeholder="URI or offline note" />
          <Input name="actor" defaultValue="ops" />
          <Button type="submit">Add reference</Button>
        </form>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="font-display text-xl">ERP projection</h2>
        <p className="text-sm text-muted">
          READY marks estate readiness. Project calls baobab-erp and moves READY → PENDING →
          PROJECTED (or FAILED). Does not create a Business Partner inside this estate.
        </p>
        {!erpConfigured ? (
          <Alert title="ERP client not configured" tone="warning">
            Set BAOBAB_ERP_BASE_URL, BAOBAB_ERP_WORKLOAD_TOKEN, BAOBAB_ERP_TENANT_ID, and
            BAOBAB_ERP_LEGAL_ENTITY_ID to enable projection.
          </Alert>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <form action={opsErpReadyAction}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="actor" value="ops" />
            <Button type="submit" variant="secondary">
              Mark ERP READY
            </Button>
          </form>
          {canProject ? (
            <form action={opsErpProjectAction}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="actor" value="ops" />
              <Button type="submit" disabled={!erpConfigured}>
                Project to ERP (READY → PROJECTED)
              </Button>
            </form>
          ) : null}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-xl">Status history</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {detail.statusEvents.map((e) => (
            <li key={e.id}>
              {e.fromStatus ?? "—"} → {e.toStatus} · {e.actor}
              {e.reason ? ` · ${e.reason}` : ""}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
