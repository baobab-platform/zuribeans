export class SupplierCanonicalLinkConflict extends Error {
  constructor() {
    super("Supplier canonical identity requires governed reconciliation.")
    this.name = "SupplierCanonicalLinkConflict"
  }
}
