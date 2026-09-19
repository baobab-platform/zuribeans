# ZURIBEANS GO-LIVE IMPLEMENTATION PLAN

## Multi-Market B2B Cross-Border Trading on the Baobab Platform

**Programme:** ZuriBeans Production Go-Live  
**Platform:** Baobab  
**Tenant:** ZuriBeans  
**Business model:** B2B trading enterprise  
**Initial operating markets:** Uganda and South Africa  
**Future model:** N markets, N trade lanes, multiple product classes, multiple currencies, multiple logistics and customs providers  
**Primary architectural principle:** ZuriBeans shall be implemented as a provider-neutral, multi-market trading enterprise in which every authorised operating market may independently buy, sell, source, procure, import, export, warehouse, distribute and fulfil.

---

# 1. PURPOSE

The purpose of this plan is to move ZuriBeans from an increasingly capable set of Baobab components into a production-ready trading operation.

The programme shall prove that ZuriBeans can perform real commercial transactions across:

- suppliers;
- customers;
- markets;
- legal jurisdictions;
- currencies;
- warehouses;
- tax regimes;
- customs regimes;
- trade lanes;
- freight providers;
- payment mechanisms;
- accounting systems;
- digital estates.

The target is not merely to make the ZuriBeans website operational.

The target is to prove:

```text
SOURCE
  ↓
PROCURE
  ↓
RECEIVE
  ↓
QUALITY CHECK
  ↓
STOCK
  ↓
PRICE
  ↓
SELL
  ↓
CONTRACT
  ↓
ALLOCATE
  ↓
EXPORT
  ↓
SHIP
  ↓
CUSTOMS
  ↓
IMPORT
  ↓
DELIVER
  ↓
INVOICE
  ↓
COLLECT
  ↓
ACCOUNT
  ↓
RECONCILE
  ↓
REPORT
```

under correct:

```text
TENANT
+
LEGAL ENTITY
+
MARKET
+
COUNTERPARTY
+
PRODUCT
+
TRADE LANE
+
CURRENCY
+
TAX
+
CUSTOMS
+
INVENTORY OWNERSHIP
+
ACCOUNTING CONTEXT
```

---

# 2. CORRECTED ZURIBEANS OPERATING MODEL

ZuriBeans shall not be designed around a fixed assumption such as:

```text
Uganda = source/export
South Africa = import/sell
```

That model is rejected.

Each authorised operating market may participate in several roles.

## 2.1 Uganda

ZuriBeans Uganda may:

- source Ugandan coffee;
- source vanilla or other products;
- procure locally;
- warehouse locally;
- sell to Ugandan B2B customers;
- export coffee to South Africa;
- export coffee to Kenya;
- export coffee to the UAE;
- export coffee to Europe;
- import South African wine;
- sell imported wine locally;
- buy from foreign suppliers;
- fulfil export orders directly from Uganda;
- receive stock transferred from another ZuriBeans operation.

## 2.2 South Africa

ZuriBeans South Africa may:

- source South African wine;
- source coffee or other products;
- procure locally;
- warehouse locally;
- sell locally;
- import coffee from Uganda;
- export wine to Uganda;
- export wine to other markets;
- fulfil customer orders directly;
- supply other ZuriBeans operations.

## 2.3 Future Markets

The architecture must therefore support:

```text
MARKET A
├── BUY
├── SELL
├── SOURCE
├── PROCURE
├── IMPORT
├── EXPORT
├── WAREHOUSE
├── DISTRIBUTE
└── FULFIL

MARKET B
├── BUY
├── SELL
├── SOURCE
├── PROCURE
├── IMPORT
├── EXPORT
├── WAREHOUSE
├── DISTRIBUTE
└── FULFIL

MARKET N
└── Any authorised combination
```

---

# 3. FUNDAMENTAL ARCHITECTURAL PRINCIPLE

A market shall not have one fixed business role.

Instead:

> **Market participation is a set of capabilities.**

Conceptually:

```yaml
market_participation:
  market: UG

  capabilities:
    legal_presence: true
    sourcing: true
    procurement: true
    selling: true
    warehousing: true
    distribution: true
    importing: true
    exporting: true
```

and:

```yaml
market_participation:
  market: ZA

  capabilities:
    legal_presence: true
    sourcing: true
    procurement: true
    selling: true
    warehousing: true
    distribution: true
    importing: true
    exporting: true
```

Future markets may enable only subsets.

---

# 4. ZURIBEANS HIGH-LEVEL BUSINESS ARCHITECTURE

```text
                              BAOBAB-PLATFORM GROUP AFRICA
                                      │
                                      │ ownership
                                      ▼
                                  ZURIBEANS
                                      │
                ┌─────────────────────┼─────────────────────┐
                │                     │                     │
                ▼                     ▼                     ▼
         Uganda Operation      South Africa Operation    Future Market
                │                     │                     │
        ┌───────┼────────┐     ┌──────┼────────┐      ┌─────┼─────┐
        │       │        │     │      │        │      │     │     │
       BUY     SELL    STOCK   BUY    SELL    STOCK   BUY   SELL STOCK
        │       │        │     │      │        │      │     │     │
        └───────┼────────┘     └──────┼────────┘      └─────┼─────┘
                │                     │                     │
                └─────────────────────┼─────────────────────┘
                                      ▼
                               TRADE LANE MODEL
                                      │
                 ┌────────────────────┼────────────────────┐
                 │                    │                    │
                 ▼                    ▼                    ▼
              Customs             Logistics              Tax
                 │                    │                    │
                 └────────────────────┼────────────────────┘
                                      ▼
                               FINANCIAL EFFECT
                                      │
                                      ▼
                                  iDempiere
```

---

# 5. THREE TRANSACTION CLASSES

Baobab must distinguish at least three transaction classes.

## 5.1 Local Commercial Trade

Example:

```text
Ugandan Supplier
      ↓
ZuriBeans Uganda
      ↓
Ugandan Customer
```

Characteristics:

- domestic procurement;
- domestic tax;
- no international customs;
- domestic logistics;
- local settlement.

---

## 5.2 External Cross-Border Trade

Example:

```text
ZuriBeans Uganda
      ↓
Kenyan B2B Customer
```

Characteristics:

- export transaction;
- customs;
- origin;
- HS classification;
- international logistics;
- foreign tax/import consequences;
- potentially FX.

---

## 5.3 Internal Cross-Market Trade

Example:

```text
ZuriBeans Uganda
      ↓
ZuriBeans South Africa
```

This must not automatically be treated as a simple stock transfer.

The Control Plane and ERP must resolve whether the transaction represents:

```text
SAME LEGAL ENTITY
      │
      └── inter-branch / internal stock movement

DIFFERENT LEGAL ENTITIES
      │
      └── intercompany commercial transaction
```

This distinction affects:

- purchase orders;
- sales orders;
- invoices;
- AR;
- AP;
- revenue recognition;
- VAT;
- customs;
- transfer pricing;
- FX;
- stock ownership;
- due-to/due-from balances;
- consolidation;
- elimination entries.

### ADR REQUIRED

**ADR candidate: Intercompany and Inter-Branch Trading Model**

This ADR should define:

- legal entity relationship handling;
- intercompany order pairing;
- inventory ownership transfer;
- transfer pricing;
- due-to/due-from accounting;
- consolidation;
- elimination;
- FX treatment;
- tax and customs consequences.

---

# 6. TRADE LANE AS A FIRST-CLASS DOMAIN CONCEPT

The system must introduce a canonical Trade Lane model.

Conceptually:

```text
TradeLane
│
├── Origin Market
├── Destination Market
├── Seller Legal Entity
├── Buyer Legal Entity
├── Ship-From Location
├── Ship-To Location
├── Product Classification
├── Customs Regime
├── Tax Regime
├── Currency Rules
├── Allowed Incoterms
├── Transport Modes
├── Required Documents
├── Compliance Requirements
├── Insurance Requirements
├── Settlement Rules
└── Effective Dates
```

Examples:

```text
UG → ZA : Coffee
ZA → UG : Wine
UG → KE : Coffee
ZA → KE : Wine
UG → UAE : Coffee
ZA → UAE : Wine
```

A trade lane determines regulatory and operational context.

It does not determine commercial ownership by itself.

### ADR REQUIRED

**ADR candidate: Canonical Trade Lane Model**

---

# 7. DIGITAL ESTATES

ZuriBeans should initially operate several digital estates.

| Digital Estate | Primary users | Purpose |
|---|---|---|
| Buyer Portal | B2B buyers | Catalogue, RFQs, quotations, orders, shipment/invoice visibility |
| Supplier Portal | Suppliers | Registration, qualification, offers, documentation |
| Operations Portal | Staff | Procurement, trade execution, inventory, shipping, customs |
| Finance Console | Finance staff | AR/AP, payments, reconciliation, financial visibility |
| Management Console | Executives/managers | KPIs, margin, trade lane performance, risk |
| Administration | Administrators | Controlled configuration |

Some may share a frontend codebase.

They should nevertheless remain separate logical estate contexts.

---

# 8. TARGET PLATFORM ARCHITECTURE

```text
                           ┌─────────────────────────┐
                           │   ZURIBEANS ESTATES     │
                           │ Buyer/Supplier/Ops/etc. │
                           └────────────┬────────────┘
                                        │
                                        ▼
                              ┌──────────────────┐
                              │    BAOBAB CP     │
                              │ Context/Policy   │
                              └────────┬─────────┘
                                       │
           ┌───────────────────────────┼───────────────────────────┐
           │                           │                           │
           ▼                           ▼                           ▼
    ┌───────────────┐           ┌───────────────┐          ┌───────────────┐
    │     IAM       │           │     TRADE     │          │      CMS      │
    │   Keycloak    │           │    Medusa     │          │    Payload    │
    └───────────────┘           └───────┬───────┘          └───────────────┘
                                        │
                          ┌─────────────┼─────────────┐
                          │             │             │
                          ▼             ▼             ▼
                    ┌──────────┐  ┌──────────┐  ┌────────────┐
                    │   ERP    │  │  PULSE   │  │ PROVIDERS  │
                    │iDempiere │  │Haystack  │  │ Logistics  │
                    └──────────┘  └──────────┘  │ Customs    │
                                               │ Payments   │
                                               │ Screening  │
                                               └────────────┘
```

---

# 9. ENGINE RESPONSIBILITY PRINCIPLE

No engine may become the owner of everything.

## Control Plane

Owns:

- tenant;
- legal entity identity;
- digital estates;
- markets;
- market participation;
- subscriptions;
- capabilities;
- providers;
- bindings;
- engine instances;
- context;
- isolation;
- readiness;
- provisioning.

## Trade

Owns commercial transaction orchestration.

## ERP

Owns accounting and enterprise transaction consequences.

## IAM

Owns identity/authentication.

## CMS

Owns content and managed document metadata where appropriate.

## Pulse

Owns intelligence and decision-support projections.

## Infrastructure

Owns runtime infrastructure and deployment.

---

# 10. COMPLETE CAPABILITY MODEL

The capability inventory below is the target state.

Each capability must eventually be classified:

```text
MANDATORY
OPTIONAL
DEFERRED
PROVIDER-DEPENDENT
```

for ZuriBeans Release 1.

---

# 10.1 TENANCY AND ORGANISATION

```text
tenant.create
tenant.provision
tenant.activate
tenant.suspend
tenant.deprovision

legal-entity.create
legal-entity.manage
legal-entity.relationship.manage

market.manage
market-participation.manage

digital-estate.register
digital-estate.manage

business-unit.manage

location.manage

warehouse-location.manage
```

Primary owner:

```text
baobab-cp
```

---

# 10.2 MARKET PARTICIPATION

```text
market.source
market.procure
market.sell
market.import
market.export
market.warehouse
market.distribute
market.fulfil
```

These should be entitlements/capabilities, not business logic hard-coded around country names.

### ADR REQUIRED

**Market Participation and Capability Entitlement Model**

---

# 10.3 IDENTITY AND ACCESS

```text
identity.user.register
identity.user.authenticate
identity.user.disable
identity.user.recover

identity.organisation.manage

identity.membership.manage

identity.workload.authenticate

identity.session.manage
identity.revocation.manage

identity.mfa.manage
identity.passkey.manage

access.role.manage
access.permission.manage
access.delegation.manage
access.step-up.authorize
```

---

# 10.4 BUYER ORGANISATIONS

```text
buyer.organisation.apply
buyer.organisation.verify
buyer.organisation.approve
buyer.organisation.reject
buyer.organisation.suspend

buyer.member.invite
buyer.member.manage

buyer.delivery-site.manage
buyer.billing-site.manage

buyer.tax-registration.manage

buyer.credit-profile.manage
buyer.credit-limit.manage

buyer.payment-term.manage

buyer.account-statement.read
```

---

# 10.5 SUPPLIER MANAGEMENT

```text
supplier.register
supplier.organisation.manage

supplier.verify
supplier.qualify
supplier.approve
supplier.reject
supplier.suspend

supplier.product-capability.manage

supplier.certification.manage
supplier.document.manage

supplier.tax-profile.manage
supplier.bank-details.manage

supplier.capacity.manage
supplier.lead-time.manage

supplier.performance.measure

supplier.audit.manage
supplier.corrective-action.manage

supplier.origin.manage
supplier.traceability.manage
```

### ADR REQUIRED

**Supplier Identity, Supplier Organisation and Supplier Master Ownership**

This should settle responsibility between:

- IAM;
- CP;
- Trade;
- ERP;
- CMS.

---

# 10.6 COUNTERPARTY MASTER

A broader Counterparty abstraction should represent:

```text
Customer
Supplier
Carrier
Freight Forwarder
Customs Broker
Warehouse Operator
Inspection Agency
Bank
Insurance Provider
Government Agency
Other Trading Counterparty
```

Capabilities:

```text
counterparty.create
counterparty.verify
counterparty.role.assign
counterparty.status.manage
counterparty.relationship.manage
counterparty.external-reference.manage
```

### ADR RECOMMENDED

**Canonical Counterparty Model**

---

# 10.7 PRODUCT MASTER

```text
product.create
product.manage

product.variant.manage
product.category.manage

product.uom.manage
product.trade-uom.manage

product.weight.manage
product.volume.manage

product.packaging.manage

product.origin.manage

product.hs-code.manage

product.tariff-classification.manage

product.regulatory-classification.manage

product.certification.manage

product.quality-specification.manage

product.batch.manage
product.lot.manage

product.expiry.manage
product.recall.manage
```

---

# 10.8 PRODUCT CATEGORY REGULATION

Coffee and wine must not use the same compliance policy.

Model:

```text
Product
   │
   ▼
Regulatory Classification
   │
   ├── Agricultural commodity
   ├── Food product
   ├── Alcohol
   ├── Controlled goods
   └── Other class
```

Then resolve:

```text
Classification
+
Origin
+
Destination
+
Transaction Type
+
Counterparty
+
Date
=
Compliance Requirements
```

### ADR REQUIRED

**Regulatory Product Classification and Rules Resolution**

---

# 10.9 MARKET ASSORTMENTS

A product is not automatically sellable everywhere.

```text
Canonical Product
       │
       ▼
Market Assortment
       │
       ▼
Commercial Offer
       │
       ▼
Customer Eligibility
```

Capabilities:

```text
assortment.market.manage
assortment.product.activate
assortment.product.suspend

assortment.import-eligibility.manage
assortment.export-eligibility.manage

assortment.customer-eligibility.manage
```

---

# 10.10 CATALOGUE

```text
catalogue.read
catalogue.manage

catalogue.customer-filter

catalogue.market-filter

catalogue.availability.read

catalogue.documents.read

catalogue.private-offer.read
```

---

# 10.11 PROCUREMENT

Procurement becomes a core capability.

```text
procurement.requirement.create

procurement.requisition.create

procurement.rfq.create

procurement.rfq.issue

procurement.supplier-bid.receive

procurement.bid.evaluate

procurement.award.manage

procurement.purchase-order.create
procurement.purchase-order.approve
procurement.purchase-order.issue

procurement.goods-receipt.manage

procurement.supplier-return.manage

procurement.invoice-match

procurement.three-way-match

procurement.close
```

Primary system:

```text
iDempiere
```

Supplier-facing workflow:

```text
ZuriBeans Supplier Estate
         ↓
Trade/API orchestration
         ↓
iDempiere procurement
```

### ADR REQUIRED

**Procurement Ownership and Trade-to-ERP Boundary**

---

# 10.12 BUY-SIDE PRICING

ZuriBeans requires procurement economics.

```text
buy-price.quote.capture

buy-price.contract.manage

buy-price.volume.manage

buy-price.currency.manage

buy-price.freight-estimate

buy-price.tax-estimate

buy-price.landed-cost.estimate

buy-price.approve
```

---

# 10.13 SELL-SIDE PRICING

```text
sell-price.base.manage

sell-price.volume.manage

sell-price.customer.manage

sell-price.contract.manage

sell-price.market.manage

sell-price.fx-adjust

sell-price.freight-adjust

sell-price.tax-adjust

sell-price.margin.manage

sell-price.minimum-margin.enforce
```

---

# 10.14 PRICING FORMULA

Conceptually:

```text
Purchase Cost
       +
Origin Costs
       +
Freight
       +
Insurance
       +
Customs
       +
Duty
       +
Import Taxes
       +
Warehousing
       +
Distribution
       +
Cost of Carry
       +
Operational Allocation
       =
Landed Cost

Landed Cost
       +
Target Margin
       =
Reference Selling Price

Reference Price
       ±
Customer Terms
       ±
Volume Discount
       ±
Contract Price
       ±
FX Adjustment
       =
Final Commercial Price
```

### ADR REQUIRED

**B2B Pricing, Landed Cost and Margin Architecture**

---

# 10.15 CUSTOMER RFQ

```text
rfq.create
rfq.submit
rfq.modify
rfq.cancel

rfq.line.manage

rfq.requirement.manage

rfq.document.attach

rfq.assign

rfq.evaluate

rfq.expire

rfq.convert-to-quotation
```

---

# 10.16 QUOTATION

```text
quotation.create

quotation.version

quotation.price

quotation.freight

quotation.tax

quotation.discount

quotation.approve

quotation.issue

quotation.accept
quotation.reject
quotation.expire

quotation.convert-to-order
```

Quotation history must be immutable and auditable.

---

# 10.17 COMMERCIAL CONTRACTS

```text
contract.create
contract.negotiate

contract.approve
contract.execute

contract.version
contract.amend

contract.validity.manage

contract.price.manage

contract.volume.manage

contract.incoterm.manage

contract.delivery-term.manage

contract.payment-term.manage

contract.credit-term.manage

contract.document.manage

contract.obligation.track

contract.renew
contract.terminate
```

---

# 10.18 SALES ORDERS

```text
sales-order.create
sales-order.validate
sales-order.price-lock

sales-order.confirm

sales-order.approve

sales-order.modify

sales-order.hold

sales-order.release

sales-order.cancel

sales-order.close
```

---

# 10.19 PURCHASE ORDERS

```text
purchase-order.create
purchase-order.approve
purchase-order.issue

purchase-order.acknowledge

purchase-order.change

purchase-order.receive

purchase-order.close
```

---

# 10.20 INTERNAL TRADE

This is a major new capability family.

```text
internal-trade.route.resolve

internal-trade.relationship.resolve

internal-trade.transfer.create

internal-trade.intercompany-sale.create

internal-trade.intercompany-purchase.create

internal-trade.mirror-document.create

internal-trade.transfer-price.calculate

internal-trade.inventory-owner.resolve

internal-trade.title-transfer.record

internal-trade.in-transit.manage

internal-trade.invoice.manage

internal-trade.receivable.manage

internal-trade.payable.manage

internal-trade.fx.manage

internal-trade.reconcile

internal-trade.eliminate
```

---

# 10.21 INVENTORY

Inventory must become multidimensional.

```text
InventoryPosition

Product
Legal Owner
Market
Warehouse
Location
Lot
Batch
Origin
Quality Status
Customs Status
Ownership Status
Quantity
Reserved Quantity
Available Quantity
In-Transit Quantity
Valuation Currency
Valuation
```

Capabilities:

```text
inventory.receive
inventory.adjust
inventory.reserve
inventory.release

inventory.allocate

inventory.transfer

inventory.pick
inventory.pack

inventory.dispatch

inventory.return

inventory.quarantine

inventory.quality-hold

inventory.count

inventory.reconcile
```

### ADR REQUIRED

**Canonical Inventory Ownership, Location and In-Transit Model**

---

# 10.22 INVENTORY TITLE AND OWNERSHIP

Physical custody and legal ownership must be separable.

Example:

```text
Coffee
Physical Location: Freight Forwarder Warehouse
Legal Owner: ZuriBeans Uganda
Customs Status: Export Cleared
Commercial Status: In Transit
```

or:

```text
Wine
Physical Location: Durban Port
Legal Owner: Supplier
Customs Status: Pending Import Clearance
Commercial Status: Purchased Under CIF
```

The title transfer point can depend on the Incoterm.

---

# 10.23 WAREHOUSE MANAGEMENT

```text
warehouse.manage
warehouse.zone.manage
warehouse.bin.manage

warehouse.receiving.manage

warehouse.putaway.manage

warehouse.pick-list.manage

warehouse.wave.manage

warehouse.pack.manage

warehouse.loading.manage

warehouse.transfer.manage

warehouse.stock-count.manage

warehouse.damage.manage

warehouse.quarantine.manage
```

Release 1 should implement only operationally justified functionality.

Do not build an enterprise WMS unnecessarily.

---

# 10.24 QUALITY MANAGEMENT

Important for agricultural and food products.

```text
quality.specification.manage

quality.sample.manage

quality.inspection.manage

quality.result.record

quality.accept
quality.reject

quality.nonconformance.manage

quality.corrective-action.manage

quality.lot-release.manage

quality.certificate.manage

quality.traceability.manage
```

Coffee-specific examples:

```text
Moisture
Grade
Screen size
Defects
Processing method
Cupping score
Origin
Harvest season
```

Wine may require different attributes.

---

# 10.25 TRACEABILITY

```text
traceability.source.record

traceability.supplier.record

traceability.origin.record

traceability.lot.link

traceability.batch.link

traceability.shipment.link

traceability.customer.link

traceability.recall.execute
```

Graph:

```text
Supplier
   ↓
Source Lot
   ↓
Received Lot
   ↓
Warehouse Batch
   ↓
Shipment
   ↓
Customer
```

---

# 10.26 SHIPPING

```text
shipping.quote.request

shipping.rate.compare

shipping.mode.select

shipping.booking.create

shipping.booking.confirm

shipping.pickup.schedule

shipping.route.plan

shipping.carrier.assign

shipping.container.manage

shipping.package.manage

shipping.weight-volume.calculate

shipping.status.track

shipping.eta.track

shipping.delivery.manage

shipping.exception.manage
```

Modes:

```text
ROAD
SEA
AIR
RAIL
MULTIMODAL
```

---

# 10.27 LOGISTICS

```text
logistics.transport-order.create

logistics.load.plan

logistics.vehicle.assign

logistics.driver.assign

logistics.dispatch.manage

logistics.route.manage

logistics.milestone.manage

logistics.border.manage

logistics.port.manage

logistics.transshipment.manage

logistics.delivery.manage

logistics.pod.manage

logistics.exception.manage

logistics.claim.manage
```

---

# 10.28 LOGISTICS PROVIDER ARCHITECTURE

```text
Baobab Trade
     │
     ▼
Logistics Port
     │
     ├── Road Haulier Adapter
     ├── Freight Forwarder Adapter
     ├── Courier Adapter
     ├── 3PL Adapter
     ├── Ocean Freight Adapter
     └── Future Baobab Logistics Engine
```

### ADR REQUIRED

**Shipping, Logistics and Freight Provider Abstraction**

---

# 10.29 SHIPMENTS

Shipment must be first-class.

```text
shipment.create

shipment.line.manage

shipment.package.manage

shipment.container.manage

shipment.origin.manage

shipment.destination.manage

shipment.incoterm.manage

shipment.carrier.manage

shipment.forwarder.manage

shipment.milestone.manage

shipment.document.manage

shipment.track

shipment.split

shipment.merge

shipment.cancel

shipment.deliver
```

---

# 10.30 SHIPMENT STATE MACHINE

```text
DRAFT
  ↓
PLANNED
  ↓
BOOKED
  ↓
READY_FOR_PICKUP
  ↓
PICKED_UP
  ↓
ORIGIN_HANDLING
  ↓
EXPORT_CLEARANCE
  ↓
IN_TRANSIT
  ↓
IMPORT_CLEARANCE
  ↓
DESTINATION_HANDLING
  ↓
OUT_FOR_DELIVERY
  ↓
DELIVERED
```

Exceptional states:

```text
HELD
CUSTOMS_HOLD
DELAYED
DAMAGED
LOST
CANCELLED
RETURNING
```

---

# 10.31 INCOTERMS

The system must support Incoterms as structured data.

```text
EXW
FCA
FAS
FOB
CFR
CIF
CPT
CIP
DAP
DPU
DDP
```

Store:

```text
Incoterm
Version
Named Place
Risk Transfer Point
Cost Responsibility
Seller Obligations
Buyer Obligations
```

Never store merely:

```text
FOB
```

without location and version.

### ADR RECOMMENDED

**Incoterm and Title Transfer Model**

---

# 10.32 TRADE COMPLIANCE

```text
trade.hs-classification.manage

trade.origin.manage

trade.preferential-origin.manage

trade.rules-of-origin.manage

trade.export-control.check

trade.import-restriction.check

trade.sanctions.screen

trade.restricted-party.screen

trade.embargo.check

trade.licence.manage

trade.permit.manage

trade.customs-value.calculate

trade.compliance-decision.manage

trade.audit.manage
```

---

# 10.33 CUSTOMS

```text
customs.export-declaration.prepare

customs.import-declaration.prepare

customs.declaration.submit

customs.entry.manage

customs.tariff.resolve

customs.duty.calculate

customs.import-tax.calculate

customs.customs-value.calculate

customs.supporting-document.manage

customs.broker.manage

customs.status.track

customs.examination.manage

customs.query.manage

customs.release.track

customs.payment.manage

customs.reconcile
```

---

# 10.34 CUSTOMS ARCHITECTURE

```text
Trade Transaction
       │
       ▼
Customs Requirement Resolver
       │
       ├── Classification
       ├── Origin
       ├── Value
       ├── Trade Lane
       ├── Incoterm
       └── Product Regulation
       │
       ▼
Customs Port
       │
       ├── Broker
       ├── Government API
       ├── Specialist Provider
       └── Manual Assisted Process
```

### ADR REQUIRED

**Customs and Trade Compliance Architecture**

---

# 10.35 TRADE DOCUMENTS

```text
document.proforma-invoice.generate

document.commercial-invoice.generate

document.packing-list.generate

document.certificate-of-origin.manage

document.phytosanitary.manage

document.quality-certificate.manage

document.inspection-certificate.manage

document.export-permit.manage

document.import-permit.manage

document.bill-of-lading.manage

document.air-waybill.manage

document.road-consignment-note.manage

document.insurance-certificate.manage

document.customs-declaration.manage

document.delivery-note.manage

document.proof-of-delivery.manage
```

---

# 10.36 DOCUMENT ARCHITECTURE

Documents require:

```text
Canonical Document ID
Tenant
Legal Entity
Transaction
Counterparty
Shipment
Document Type
Issuer
Issue Date
Effective Date
Expiry
Version
Classification
Retention Policy
Checksum
Storage Location
```

### ADR REQUIRED

**Canonical Document and Evidence Architecture**

---

# 10.37 TAX

```text
tax.registration.manage

tax.context.resolve

tax.rate.manage

tax.product-category.manage

tax.customer-status.manage

tax.exemption.manage

tax.zero-rate.manage

tax.import-vat.calculate

tax.export-treatment.calculate

tax.withholding.manage

tax.tax-point.determine

tax.invoice.validate

tax.evidence.manage

tax.reconcile
```

Tax rules must be:

```text
effective-dated
jurisdiction-aware
product-aware
counterparty-aware
transaction-aware
```

### ADR REQUIRED

**Multi-Jurisdiction Tax Decision Architecture**

---

# 10.38 LANDED COST

```text
landed-cost.purchase-price

landed-cost.origin-charges

landed-cost.freight

landed-cost.insurance

landed-cost.export-fees

landed-cost.import-duty

landed-cost.import-vat

landed-cost.customs-brokerage

landed-cost.port-fees

landed-cost.storage

landed-cost.demurrage

landed-cost.detention

landed-cost.local-delivery

landed-cost.allocate

landed-cost.estimate

landed-cost.actual

landed-cost.variance
```

---

# 10.39 CURRENCY AND FX

```text
currency.manage

fx.rate.ingest

fx.rate.validate

fx.rate.approve

fx.rate.lock

fx.transaction-rate.resolve

fx.exposure.measure

fx.realised-gain-loss.calculate

fx.unrealised-gain-loss.calculate
```

Initial currencies may include:

```text
UGX
ZAR
USD
EUR
GBP
```

as needed.

---

# 10.40 PAYMENT TERMS

```text
PREPAYMENT
COD
NET_7
NET_14
NET_30
NET_60
DEPOSIT_BALANCE
LETTER_OF_CREDIT
DOCUMENTARY_COLLECTION
```

---

# 10.41 PAYMENTS

```text
payment.request

payment.receive

payment.authorize

payment.capture

payment.allocate

payment.partial.allocate

payment.reverse

payment.refund

payment.proof.manage

payment.bank-transfer.track

payment.overpayment.manage

payment.underpayment.manage

payment.reconcile
```

---

# 10.42 CREDIT MANAGEMENT

```text
credit.application.manage

credit.assessment.manage

credit.limit.manage

credit.term.manage

credit.exposure.calculate

credit.available.calculate

credit.hold.manage

credit.release.manage

credit.overdue.manage

credit.review.manage
```

---

# 10.43 TRADE FINANCE

Architecture should anticipate:

```text
trade-finance.letter-of-credit

trade-finance.documentary-collection

trade-finance.bank-guarantee

trade-finance.performance-bond

trade-finance.credit-insurance

trade-finance.invoice-finance

trade-finance.pre-export-finance
```

Release 1 may initially treat these as structured references and documents.

### ADR FUTURE

**Trade Finance Capability Architecture**

---

# 10.44 ACCOUNTS RECEIVABLE

```text
ar.invoice.issue

ar.credit-note.issue

ar.debit-note.issue

ar.payment.allocate

ar.statement.generate

ar.ageing.calculate

ar.collection.manage

ar.writeoff.manage
```

Owner:

```text
iDempiere
```

---

# 10.45 ACCOUNTS PAYABLE

```text
ap.invoice.capture

ap.invoice.validate

ap.three-way-match

ap.payable.manage

ap.payment-schedule.manage

ap.payment.approve

ap.payment.execute

ap.credit-note.manage
```

---

# 10.46 GENERAL LEDGER

```text
gl.journal.post

gl.account.manage

gl.period.manage

gl.currency.manage

gl.fx-revalue

gl.cost-centre.manage

gl.profit-centre.manage

gl.intercompany.manage

gl.close.manage
```

---

# 10.47 INTERCOMPANY ACCOUNTING

```text
intercompany.due-to.manage

intercompany.due-from.manage

intercompany.invoice.manage

intercompany.transfer-price.manage

intercompany.fx.manage

intercompany.reconcile

intercompany.eliminate

intercompany.consolidate
```

---

# 10.48 FINANCIAL REPORTING

```text
finance.trial-balance

finance.income-statement

finance.balance-sheet

finance.cashflow

finance.customer-profitability

finance.product-profitability

finance.supplier-profitability

finance.trade-lane-profitability

finance.market-profitability

finance.order-profitability
```

---

# 10.49 COSTING

```text
cost.product.calculate

cost.inventory.calculate

cost.landed-cost.allocate

cost.freight.allocate

cost.trade-lane.calculate

cost.standard-vs-actual

cost.margin.calculate
```

---

# 10.50 RETURNS AND CLAIMS

```text
return.request

return.authorize

return.receive

return.inspect

return.disposition.manage

return.refund

claim.shipping.manage

claim.quality.manage

claim.shortage.manage

claim.damage.manage

claim.insurance.manage
```

---

# 10.51 CUSTOMER SERVICE

```text
service.case.create

service.case.assign

service.case.resolve

service.order-query

service.shipment-query

service.invoice-query

service.claim.manage

service.communication.manage
```

---

# 10.52 NOTIFICATIONS

```text
notification.email.send

notification.sms.send

notification.whatsapp.send

notification.in-app.send

notification.template.manage

notification.preference.manage

notification.delivery-track
```

Provider-neutral.

---

# 10.53 CONTENT

```text
content.page.manage

content.product.manage

content.media.manage

content.market-localisation.manage

content.locale.manage

content.publish

content.policy.manage
```

Owner:

```text
Payload CMS
```

---

# 10.54 AUDIT

Every material operation must record:

```text
Actor
Action
Tenant
Legal Entity
Market
Resource
Correlation ID
Timestamp
Before
After
Reason
Origin
```

---

# 10.55 EVENTS

Canonical event examples:

```text
baobab.procurement.purchase-order-issued.v1

baobab.inventory.goods-received.v1

baobab.commercial.quotation-issued.v1

baobab.commerce.order-confirmed.v1

baobab.inventory.stock-reserved.v1

baobab.trade.shipment-created.v1

baobab.trade.export-cleared.v1

baobab.trade.import-cleared.v1

baobab.trade.shipment-delivered.v1

baobab.finance.invoice-issued.v1

baobab.finance.payment-received.v1
```

---

# 10.56 RECONCILIATION

```text
reconcile.identity

reconcile.mapping

reconcile.counterparty

reconcile.product

reconcile.inventory

reconcile.procurement

reconcile.order

reconcile.shipment

reconcile.customs

reconcile.invoice

reconcile.payment

reconcile.accounting

reconcile.event

reconcile.provider
```

---

# 10.57 INTELLIGENCE

Pulse eventually provides:

```text
intelligence.fx.query

intelligence.commodity.query

intelligence.market.query

intelligence.trade-statistics.query

intelligence.regulatory.query

intelligence.logistics.query

intelligence.route-risk.assess

intelligence.supplier-risk.assess

intelligence.customer-risk.assess

intelligence.price-anomaly.detect

intelligence.margin-risk.assess

intelligence.trade-opportunity.identify
```

Most should be optional for Release 1.

---

# 11. ENGINE OWNERSHIP MATRIX

| Capability | System of record / primary owner | Supporting systems |
|---|---|---|
| Tenant | CP | Shared |
| Legal entity | CP | ERP |
| Markets | CP | Shared |
| Trade lanes | CP/domain service | Trade |
| Identity | IAM | CP |
| Buyer organisations | Trade | IAM/ERP |
| Suppliers | ERP/Trade | IAM/CP |
| Counterparties | Canonical CP + domain owners | ERP/Trade |
| Products | Trade | ERP |
| Catalogue | Trade | CMS |
| Procurement | ERP | Trade |
| Buy pricing | ERP/Trade | Pulse |
| Sell pricing | Trade | ERP/Pulse |
| RFQ | Trade | — |
| Quotation | Trade | — |
| Contracts | Trade | CMS/ERP |
| Sales orders | Trade | ERP |
| Purchase orders | ERP | Trade |
| Inventory availability | Trade | ERP |
| Inventory valuation | ERP | Trade |
| Warehousing | Trade initially | ERP |
| Shipment | Trade | ERP |
| Logistics | Provider | Trade |
| Customs | Provider/Trade extension | ERP |
| Tax calculation | Trade + ERP | external provider |
| Payments | Trade | ERP |
| Credit | ERP | Trade |
| Accounting | ERP | — |
| CMS content | CMS | Trade |
| Documents | CMS/object storage | all |
| Intelligence | Pulse | all |
| Events | each domain | Infrastructure |
| Runtime infrastructure | Infrastructure | — |

---

# 12. MEDUSA EXTENSION STRATEGY

Medusa should remain the commerce kernel.

## Reuse native capabilities where appropriate

```text
Products
Pricing
Customers
Customer Groups
Sales Channels
Inventory
Stock Locations
Orders
Payments
Fulfilment
Regions
Tax integration points
```

## Baobab custom modules

```text
B2B Organisation

Organisation Membership

Commercial Terms

RFQ

Quotation

Commercial Contract

Purchase Approval

Trade Lane

Shipment

Trade Compliance

Trade Documents

Supplier Projection

Landed Cost Projection

Credit Decision Projection

Canonical Mapping

ERP Projection
```

Do not fork Medusa core unless unavoidable.

---

# 13. IDEMPIERE EXTENSION STRATEGY

iDempiere must become fully operational, not merely receive order projections.

Required scope:

```text
LEGAL STRUCTURE

Client
Organisation
Business Partner
Warehouse
Accounting Schema

PROCUREMENT

Requisition
Supplier RFQ where used
Purchase Order
Goods Receipt
Supplier Invoice

SALES

Sales Order
Shipment
Customer Invoice

FINANCE

AR
AP
Bank
Payment
GL
Tax
FX
Costing

INVENTORY

Inventory Valuation
Transfers
In-Transit Value

CROSS-BORDER

Landed Cost
Duty
Import Tax
Freight Allocation

INTERCOMPANY

Due To
Due From
Transfer Pricing
Mirrored Orders
Reconciliation
Elimination
```

Required Baobab integration extensions:

```text
Canonical IDs

Control Plane Context

Canonical Mapping

REST APIs

OIDC

Event Inbox

Event Outbox

Idempotency

Reconciliation

Observability
```

---

# 14. CONTROL PLANE TARGET MODEL

Conceptual desired state:

```yaml
tenant:
  key: zuribeans

operating_markets:

  - market: UG
    capabilities:
      sourcing: true
      procurement: true
      selling: true
      warehousing: true
      importing: true
      exporting: true
      distribution: true

  - market: ZA
    capabilities:
      sourcing: true
      procurement: true
      selling: true
      warehousing: true
      importing: true
      exporting: true
      distribution: true

digital_estates:
  - zuribeans-buyer
  - zuribeans-supplier
  - zuribeans-operations
  - zuribeans-management

solution_profiles:
  - b2b
  - crossborder
  - commodity-trade
  - supplier-management
  - procurement
```

---

# 15. TRADE LANE EXAMPLES

```yaml
trade_lanes:

  - code: UG-ZA
    origin: UG
    destination: ZA
    enabled: true

  - code: ZA-UG
    origin: ZA
    destination: UG
    enabled: true

  - code: UG-KE
    origin: UG
    destination: KE
    enabled: true

  - code: ZA-KE
    origin: ZA
    destination: KE
    enabled: true
```

Trade lane existence does not imply legal presence in the destination.

---

# 16. CAPABILITY READINESS MODEL

Every capability must move through:

```text
UNKNOWN
   ↓
DECLARED
   ↓
CONTRACTED
   ↓
IMPLEMENTED
   ↓
PROVISIONED
   ↓
INTEGRATED
   ↓
TESTED
   ↓
READY
```

Possible exceptions:

```text
DEGRADED
BLOCKED
SUSPENDED
DEFERRED
```

---

# 17. IMPLEMENTATION PROGRAMME

---

# GATE ZB-00 — ARCHITECTURAL DECISION FREEZE

Before significant further implementation:

1. identify unresolved architectural questions;
2. create ADRs;
3. approve decisions;
4. translate decisions into contracts.

Minimum ADR backlog:

| ADR | Priority |
|---|---:|
| Trade Lane Model | P0 |
| Market Participation Model | P0 |
| Intercompany/Inter-branch Trading | P0 |
| Inventory Ownership/In-Transit | P0 |
| Procurement Boundary | P0 |
| B2B Pricing/Landed Cost | P0 |
| Customs/Trade Compliance | P0 |
| Logistics Provider Model | P0 |
| Multi-Jurisdiction Tax | P0 |
| Counterparty Model | P0 |
| Product Regulatory Classification | P1 |
| Document/Evidence Architecture | P1 |
| Incoterm/Title Transfer | P1 |
| Trade Finance | P2 |

Exit criterion:

```text
No P0 architectural ambiguity remains.
```

---

# GATE ZB-01 — CONTRACT CONVERGENCE

Repositories:

```text
shared
baobab-cp
baobab-trade
baobab-erp
baobab-iam
baobab-cms
zuribeans
```

Tasks:

- reconcile canonical IDs;
- reconcile event envelopes;
- publish buyer organisation contracts;
- publish supplier contracts;
- publish RFQ contracts;
- publish quotation contracts;
- publish procurement contracts;
- publish shipment contracts;
- publish Trade Lane contracts;
- publish inventory ownership contracts;
- publish trade-document contracts;
- publish ERP projection contracts;
- publish intercompany contracts.

Exit:

```text
All Release-1 cross-repo contracts versioned in Shared.
```

---

# GATE ZB-02 — CONTROL PLANE COMPLETION

Implement minimum production Control Plane spine.

Required resources:

```text
Tenant

LegalEntity

LegalEntityRelationship

Market

MarketParticipation

DigitalEstate

Capability

CapabilityGrant

CapabilityBinding

Engine

EngineInstance

TradeLane

IsolationProfile

Context

Provisioning

Readiness
```

Required lifecycle:

```text
PLAN
 ↓
APPLY
 ↓
RECONCILE
 ↓
READY
 ↓
ACTIVE
```

Exit:

```text
ZuriBeans declaratively provisioned.
```

No manual database manipulation allowed as production provisioning.

---

# GATE ZB-03 — IAM AND ISOLATION

Complete:

```text
Workforce SSO

Buyer organisations

Supplier identities

Organisation membership

Workload identities

MFA

Revocation

Role mapping

Control Plane context

Trade authorization

ERP authorization
```

Mandatory tests:

```text
Buyer A ≠ Buyer B

Supplier ≠ Buyer

Staff ≠ Buyer

Thamani ≠ ZuriBeans

ZuriBeans UG context ≠ arbitrary ZA authority

Revoked workload → rejected

Suspended organisation → rejected
```

---

# GATE ZB-04 — BUYER ONBOARDING

Journey:

```text
Buyer Applies
      ↓
Organisation Created
      ↓
KYB Details
      ↓
Documents
      ↓
Verification
      ↓
Commercial Review
      ↓
Credit Review
      ↓
Approval
      ↓
Buyer Activated
```

Buyer account must support:

```text
Members
Roles
Delivery Sites
Billing Sites
Tax Information
Credit
Payment Terms
Price Agreements
Contracts
```

---

# GATE ZB-05 — SUPPLIER ONBOARDING

```text
Supplier Applies
      ↓
Organisation Created
      ↓
KYB
      ↓
Products
      ↓
Capacity
      ↓
Certifications
      ↓
Bank Details
      ↓
Tax
      ↓
Quality Requirements
      ↓
Compliance
      ↓
Review
      ↓
Approved Supplier
```

---

# GATE ZB-06 — PRODUCT AND ASSORTMENT MASTER

Implement:

```text
Canonical Products

Variants

Trade UOM

Origin

HS Codes

Regulatory Classification

Certifications

Quality Specifications

Market Eligibility

Market Assortments

Packaging
```

Examples:

```text
Ugandan Arabica Coffee
Ugandan Robusta Coffee
Vanilla
South African Wine
```

---

# GATE ZB-07 — PROCUREMENT

End-to-end:

```text
Demand
  ↓
Purchase Requisition
  ↓
Supplier RFQ
  ↓
Supplier Bid
  ↓
Evaluation
  ↓
Award
  ↓
Purchase Order
  ↓
Supplier Confirmation
  ↓
Goods Receipt
  ↓
Quality Inspection
  ↓
Supplier Invoice
  ↓
AP
```

---

# GATE ZB-08 — BUY-SIDE COSTING

Implement:

```text
Supplier Price
+
Origin Logistics
+
Packing
+
Inspection
+
Export Cost
+
Freight
+
Insurance
+
Import Cost
+
Tax
+
Warehouse
=
Expected Landed Cost
```

---

# GATE ZB-09 — INVENTORY

Prove:

```text
Goods Receipt
      ↓
Lot
      ↓
Quality
      ↓
Inventory Position
      ↓
Available
      ↓
Reserve
      ↓
Allocate
      ↓
Pick
      ↓
Pack
      ↓
Dispatch
```

---

# GATE ZB-10 — CUSTOMER COMMERCIAL JOURNEY

```text
Catalogue
     ↓
RFQ
     ↓
Quotation
     ↓
Negotiation
     ↓
Commercial Approval
     ↓
Customer PO
     ↓
Sales Order
```

Support:

```text
contract price
volume pricing
customer-specific price
minimum quantity
minimum order value
payment terms
credit limit
Incoterm
```

---

# GATE ZB-11 — INTERNAL CROSS-MARKET TRADE

Scenario:

```text
ZuriBeans Uganda
       ↓
ZuriBeans South Africa
```

System must resolve:

```text
same legal entity?
       │
  ┌────┴────┐
 YES       NO
  │         │
Transfer   Intercompany
  │         │
  ▼         ▼
Stock      PO + SO
Movement   + AR/AP
```

Test both architecture paths even if only one applies initially.

---

# GATE ZB-12 — EXPORT EXECUTION

```text
Confirmed Order
      ↓
Export Eligibility
      ↓
Inventory Allocation
      ↓
HS Classification
      ↓
Origin
      ↓
Incoterm
      ↓
Required Documents
      ↓
Export Declaration
      ↓
Freight Booking
      ↓
Customs Release
      ↓
Dispatch
```

---

# GATE ZB-13 — SHIPPING AND LOGISTICS

Implement:

```text
Shipping Requirement
      ↓
Rate Request
      ↓
Provider Options
      ↓
Carrier Selection
      ↓
Booking
      ↓
Pickup
      ↓
Origin Handling
      ↓
International Transport
      ↓
Border/Port
      ↓
Destination Transport
      ↓
Delivery
      ↓
POD
```

---

# GATE ZB-14 — IMPORT AND CUSTOMS

```text
Incoming Shipment
      ↓
Import Eligibility
      ↓
Customs Entry
      ↓
Customs Value
      ↓
Duty
      ↓
Import Tax
      ↓
Inspection
      ↓
Clearance
      ↓
Release
      ↓
Warehouse Receipt
```

---

# GATE ZB-15 — TAX

Prove:

```text
LOCAL SALE

CROSS-BORDER EXPORT

CROSS-BORDER IMPORT

INTERCOMPANY TRANSACTION

STOCK TRANSFER

CREDIT NOTE

RETURN
```

for applicable jurisdictions.

---

# GATE ZB-16 — ERP ACCOUNTING SPINE

Absolute production blocker.

## Sell side

```text
Sales Order
    ↓
Shipment
    ↓
Invoice
    ↓
AR
    ↓
Receipt
    ↓
GL
```

## Buy side

```text
Purchase Order
    ↓
Receipt
    ↓
Supplier Invoice
    ↓
AP
    ↓
Payment
    ↓
GL
```

## Internal

```text
Intercompany PO/SO
       ↓
Shipment
       ↓
Invoice Pair
       ↓
AR/AP
       ↓
Settlement
       ↓
Elimination
```

---

# GATE ZB-17 — PAYMENTS AND CREDIT

Implement:

```text
Prepayment

Deposit

Bank Transfer

Net Terms

Partial Payment

Payment Allocation

Refund

Credit Note

Overpayment

Underpayment
```

Credit controls must be enforced before order release where required.

---

# GATE ZB-18 — CONTENT AND DOCUMENT MANAGEMENT

CMS:

```text
Pages
Product content
Policies
Trade information
Market-localised content
Help
Supplier content
```

Object storage:

```text
Certificates
Contracts
Invoices
Customs documents
Shipping documents
Insurance
Supplier evidence
POD
```

---

# GATE ZB-19 — EVENTS

All cross-engine writes require:

```text
Transactional Outbox

Canonical Event

Idempotent Consumer

Retry

DLQ

Replay

Correlation ID

Event Receipt

Reconciliation
```

---

# GATE ZB-20 — OBSERVABILITY

Technical:

```text
Logs
Metrics
Traces
Health
Readiness
Alerts
SLOs
Dashboards
```

Business:

```text
Procurement lead time

RFQ conversion

Quote conversion

Order conversion

Inventory availability

Shipment performance

Customs delay

Supplier OTIF

Customer OTIF

Receivables ageing

Gross margin

Trade lane profitability
```

---

# GATE ZB-21 — INFRASTRUCTURE

Target:

```text
Development
      ↓
Staging
      ↓
Production
```

Production capabilities:

```text
DNS
TLS
APISIX
Secrets
Databases
RabbitMQ
Redis
Object Storage
IAM
CP
Trade
ERP
CMS
Pulse
OTel
Monitoring
Backups
CI/CD
Rollback
```

---

# GATE ZB-22 — SECURITY

Mandatory:

```text
Threat Model

OIDC/OAuth Review

MFA

Workload Identity

Secrets Rotation

Encryption

Tenant Isolation

Buyer Isolation

Supplier Isolation

Rate Limiting

WAF

SAST

DAST

Dependency Scan

Container Scan

SBOM

Penetration Test

Incident Response

Break Glass
```

---

# GATE ZB-23 — BACKUP AND DISASTER RECOVERY

Actually test:

```text
PostgreSQL restore

ERP restore

IAM restore

CMS restore

Object storage recovery

RabbitMQ recovery

Redis loss

Application rollback

Compromised credentials

Regional outage assumptions
```

---

# GATE ZB-24 — PERFORMANCE

Test:

```text
Authentication

Catalogue

Pricing

RFQ

Quotation

Order

Inventory

Shipment

Payment callback

ERP event ingestion

Document upload

Tracking
```

Define SLOs and capacity assumptions.

---

# GATE ZB-25 — MASTER DATA

Production master data:

```text
Legal entities

Markets

Trade lanes

Currencies

Warehouses

Products

UOMs

HS codes

Tax categories

Suppliers

Customers

Price lists

Commercial terms

Payment terms

Incoterms

Customs brokers

Carriers

Freight forwarders

Document templates

Accounting master data
```

---

# GATE ZB-26 — BUSINESS SIMULATION

At least the following scenarios must pass.

---

## Scenario 1 — Uganda Coffee → South Africa

```text
Ugandan Supplier
      ↓
Procurement
      ↓
Goods Receipt
      ↓
Quality
      ↓
Inventory
      ↓
Transfer/Sale to ZuriBeans SA
      ↓
Export
      ↓
Freight
      ↓
Customs
      ↓
Import
      ↓
South African Inventory
      ↓
South African Customer
      ↓
Invoice
      ↓
Settlement
```

---

## Scenario 2 — South African Wine → Uganda

```text
South African Winery
      ↓
Procurement
      ↓
Wine Inventory
      ↓
Export
      ↓
Customs
      ↓
Shipment
      ↓
Uganda Import
      ↓
Uganda Inventory
      ↓
Ugandan B2B Customer
```

---

## Scenario 3 — Uganda Coffee → External Market

```text
ZuriBeans Uganda
      ↓
Kenyan Buyer
      ↓
RFQ
      ↓
Quote
      ↓
Order
      ↓
Export
      ↓
Shipment
      ↓
Customer Delivery
```

No legal presence in Kenya required.

---

## Scenario 4 — Local South African Sale

```text
ZA Inventory
    ↓
ZA B2B Customer
    ↓
Order
    ↓
Domestic Fulfilment
    ↓
Invoice
    ↓
Payment
```

---

## Scenario 5 — Net-30 Customer

```text
Order
 ↓
Credit Check
 ↓
Approved
 ↓
Shipment
 ↓
Invoice
 ↓
AR
 ↓
Payment Day 27
```

---

## Scenario 6 — Customs Hold

```text
Shipment
 ↓
Customs Hold
 ↓
Alert
 ↓
Missing Document
 ↓
Document Supplied
 ↓
Customs Release
 ↓
Continue
```

---

## Scenario 7 — Partial Shipment

```text
Order 1,000 units
       ↓
Available 700
       ↓
700 shipped
       ↓
300 backordered
       ↓
Second shipment
```

---

## Scenario 8 — Damaged Cargo

```text
Shipment
 ↓
Damage
 ↓
Inspection
 ↓
Claim
 ↓
Partial Acceptance
 ↓
Credit Note
 ↓
Insurance Claim
```

---

## Scenario 9 — Intercompany FX

```text
UG entity
 ↓
USD invoice
 ↓
ZA entity
 ↓
ZAR books
 ↓
FX posting
 ↓
Settlement
 ↓
FX gain/loss
```

---

# GATE ZB-27 — ADVERSARIAL TESTING

Attempt deliberately to:

- cross tenant boundaries;
- access another buyer organisation;
- access supplier-only data;
- access another market without entitlement;
- manipulate context headers;
- replay events;
- replay payments;
- reuse expired tokens;
- use revoked workloads;
- invoke another legal entity;
- alter shipment ownership;
- circumvent credit limits;
- inject unsupported currency;
- manipulate tax context;
- change price after quotation acceptance.

Every attack should fail safely.

---

# GATE ZB-28 — OPERATIONAL READINESS

Operational documentation:

```text
Service Runbooks

Incident Runbooks

Deployment Runbooks

Rollback Runbooks

Backup Runbooks

Restore Runbooks

Customs Exception Runbook

Shipment Exception Runbook

Payment Exception Runbook

ERP Reconciliation Runbook

Security Incident Runbook
```

Staff training required.

---

# GATE ZB-29 — CONTROL PLANE P13 CERTIFICATION

Final process:

```text
REQUEST
   ↓
VALIDATE
   ↓
PLAN
   ↓
APPLY
   ↓
PROVISION
   ↓
RECONCILE
   ↓
READINESS
   ↓
READY
   ↓
ACTIVE
```

No manual override.

---

# 18. RELEASE PRIORITIES

## P0 — Launch blockers

```text
Shared contracts

Control Plane

IAM

Buyer organisations

Suppliers

Products

Procurement

Pricing

RFQ

Quotation

Sales Orders

Purchase Orders

Inventory

Trade Lanes

Internal Trade

ERP

Tax

Customs

Shipping

Documents

Payments

Accounting

Infrastructure

Security

Backup

Reconciliation

Observability
```

---

## P1 — Strongly desired

```text
Advanced supplier qualification

Advanced landed cost

Detailed warehouse workflows

Credit automation

Detailed logistics tracking

Quality management

Claims

Returns

Advanced traceability
```

---

## P2 — Post-launch

```text
AI recommendations

Predictive commodity intelligence

Route optimisation

Automated counterparty scoring

Trade finance automation

Advanced forecasting

Electronic signatures

Advanced supplier analytics
```

---

# 19. REPOSITORY EXECUTION PRIORITY

| Repository | Priority | Primary responsibility |
|---|---:|---|
| `baobab-platform/shared` | P0 | Contracts |
| `baobab-platform/baobab-cp` | P0 | Context/provisioning/readiness |
| `baobab-platform/baobab-iam` | P0 | Identity/isolation |
| `baobab-platform/baobab-trade` | P0 | Commercial/trade orchestration |
| `baobab-platform/baobab-erp` | P0 | Procurement/accounting |
| `baobab-platform/infrastructure` | P0 | Production runtime |
| `baobab-platform/zuribeans` | P1 | User-facing B2B estates |
| `baobab-platform/baobab-cms` | P1 | Content/documents |
| `baobab-platform/baobab-pulse` | P2 | Intelligence |

This priority is about **implementation dependency**, not business importance.

---

# 20. RECOMMENDED EXECUTION WAVES

## Wave 1 — Architecture

```text
ADRs
Shared Contracts
CP Model
```

## Wave 2 — Identity and Core Masters

```text
IAM
Legal Entities
Markets
Counterparties
Products
```

## Wave 3 — Commercial

```text
Buyer
Supplier
Procurement
RFQ
Quotation
Pricing
Orders
```

## Wave 4 — Inventory and Trade

```text
Inventory
Trade Lanes
Internal Trade
Shipping
Customs
Tax
```

## Wave 5 — Financial

```text
ERP
AR
AP
GL
FX
Landed Cost
Payments
```

## Wave 6 — Production Platform

```text
Infrastructure
Security
Observability
DR
```

## Wave 7 — Certification

```text
Integrated Simulations
Adversarial Tests
P13
Go Live
```

---

# 21. CRITICAL PATH

```text
ADRs
  ↓
Shared Contracts
  ↓
Control Plane
  ↓
IAM
  ↓
Counterparty/Product Masters
  ↓
Procurement + B2B Trade
  ↓
Inventory
  ↓
Trade Lane
  ↓
Shipping + Customs + Tax
  ↓
ERP
  ↓
Infrastructure
  ↓
Integrated Staging
  ↓
Business Simulation
  ↓
P13
  ↓
GO LIVE
```

---

# 22. DEFINITION OF DONE FOR EACH CAPABILITY

A capability is not done because:

```text
code exists
```

It is done only when:

```text
Contract exists
      +
Implementation exists
      +
Provisioning exists
      +
Authorization exists
      +
Integration exists
      +
Tests pass
      +
Isolation passes
      +
Audit exists
      +
Metrics exist
      +
Reconciliation exists
      +
Runbook exists
```

---

# 23. GO-LIVE GO/NO-GO

| Domain | Required state |
|---|---|
| Tenant | READY |
| Legal entity | READY |
| Markets | READY |
| Trade lanes | READY |
| IAM | PASS |
| Buyer isolation | PASS |
| Supplier isolation | PASS |
| Buyer onboarding | PASS |
| Supplier onboarding | PASS |
| Procurement | PASS |
| Catalogue | PASS |
| Pricing | PASS |
| RFQ | PASS |
| Quotation | PASS |
| Orders | PASS |
| Inventory | PASS |
| Internal trade | PASS |
| Export | PASS |
| Import | PASS |
| Shipping | PASS |
| Logistics | PASS |
| Customs | PASS |
| Tax | PASS |
| ERP | PASS |
| AR/AP | PASS |
| GL | PASS |
| FX | PASS |
| Payments | PASS |
| Documents | PASS |
| Events | PASS |
| Reconciliation | PASS |
| Security | PASS |
| Backup/restore | PASS |
| Observability | PASS |
| Business simulation | PASS |
| P13 | READY |

Any mandatory `FAIL` means:

```text
NO-GO
```

---

# 24. WHAT SHOULD NOT DELAY RELEASE 1

Do not block ZuriBeans on:

- sophisticated AI recommendations;
- advanced commodity prediction;
- every possible logistics carrier;
- every global customs integration;
- every future product class;
- every potential market;
- Kubernetes;
- service mesh;
- advanced multi-region active-active;
- complex warehouse robotics;
- automated trade finance;
- blockchain;
- full transport management suite.

Design for extension.

Do not implement everything before launch.

---

# 25. WHAT ABSOLUTELY MUST NOT BE DEFERRED

These cannot be compromised:

```text
Tenant isolation

Legal-entity correctness

Buyer isolation

Supplier isolation

Accounting integrity

Inventory integrity

Pricing integrity

Tax correctness

Customs evidence

Canonical identity

Audit

Idempotency

Reconciliation

Security

Backup

Restore

Observability
```

---

# 26. FINAL TARGET STATE

ZuriBeans is ready for production when Baobab can execute this without architectural shortcuts:

```text
South African Winery
         │
         ▼
ZuriBeans South Africa
         │
     Procurement
         │
         ▼
  ZA Warehouse Stock
         │
         ▼
Internal/Cross-Border Trade
         │
         ▼
        Export
         │
         ▼
      Logistics
         │
         ▼
       Customs
         │
         ▼
     Uganda Import
         │
         ▼
 ZuriBeans Uganda Stock
         │
         ▼
     Ugandan Buyer
         │
         ▼
       Invoice
         │
         ▼
       Payment
         │
         ▼
      Accounting
```

while simultaneously supporting:

```text
Ugandan Coffee Supplier
         │
         ▼
 ZuriBeans Uganda
         │
         ├────────► Uganda Customer
         │
         ├────────► ZuriBeans South Africa
         │
         ├────────► Kenya Customer
         │
         └────────► Other Market
```

with the correct:

```text
Tenant
Legal Entity
Market
Counterparty
Trade Lane
Product
Inventory Ownership
Tax
Customs
Currency
Shipment
Accounting
Audit
```

context throughout the entire transaction.

---

# 27. PROGRAMME TEST

The programme should continually ask one question:

> **Can ZuriBeans buy, hold, move, import, export and sell goods in any authorised operating market—or between authorised markets—while preserving correct commercial, inventory, customs, tax, financial, security and accounting state from supplier to settlement?**

If the answer is not demonstrably yes, the relevant gate is not complete.

---

# 28. ARCHITECTURAL DISCIPLINE

Where implementation exposes ambiguity, do not silently decide in code.

Use:

```text
QUESTION
   ↓
ARCHITECTURAL ANALYSIS
   ↓
ADR
   ↓
APPROVED DECISION
   ↓
CANONICAL CONTRACT
   ↓
IMPLEMENTATION
   ↓
CONFORMANCE TEST
```

This should be particularly strict for:

- legal entities;
- intercompany trading;
- inventory ownership;
- tax;
- customs;
- pricing;
- trade lanes;
- supplier identity;
- counterparty identity;
- shipment ownership;
- document authority;
- ERP integration;
- market participation.

The purpose is not to produce more documentation for its own sake.

The purpose is to prevent local implementation decisions from becoming accidental Baobab architecture.