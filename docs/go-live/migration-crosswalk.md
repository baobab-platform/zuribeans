# v1 historical → v2.0 gate preservation crosswalk

The original unversioned plan remains unchanged in `docs/adr/`. **Every** original gate is retained as a requirement/evidence input but is re-organised here under v2.0. A gate being mapped is _not_ a declaration of implementation, qualification or activation. Release gating now follows Shared EA v2.3 and its preserved v2.2 normative L4 IDs.

| Original gate | Successor   | Preserved obligation                                                                                                       |
| ------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| ZB-00         | G00/G02     | Architecture decisions and unresolved semantic ownership                                                                   |
| ZB-01         | G02         | Contract convergence                                                                                                       |
| ZB-02         | G01/G03     | Control Plane Organisation, Tenant and market authority                                                                    |
| ZB-03         | G03         | IAM and isolation                                                                                                          |
| ZB-04         | G05         | Buyer onboarding                                                                                                           |
| ZB-05         | G05         | Supplier onboarding                                                                                                        |
| ZB-06         | G06         | Product and assortment master                                                                                              |
| ZB-07         | G07         | Procurement                                                                                                                |
| ZB-08         | G06/G08     | Buy-side costing                                                                                                           |
| ZB-09         | G08         | Inventory and ownership                                                                                                    |
| ZB-10         | G07         | Customer RFQ to order                                                                                                      |
| ZB-11         | G08/G09     | Interbranch/intercompany transactions                                                                                      |
| ZB-12         | G09         | Export execution                                                                                                           |
| ZB-13         | G09         | Shipping and logistics                                                                                                     |
| ZB-14         | G09         | Imports and customs                                                                                                        |
| ZB-15         | G06/G09/G10 | Tax and compliance                                                                                                         |
| ZB-16         | G08/G10     | ERP accounting spine                                                                                                       |
| ZB-17         | G10         | Payments and credit                                                                                                        |
| ZB-18         | G04/G09     | CMS and document management                                                                                                |
| ZB-19         | G02/G11     | Events and idempotency                                                                                                     |
| ZB-20         | G12         | Observability                                                                                                              |
| ZB-21         | G12         | Infrastructure                                                                                                             |
| ZB-22         | G03/G12     | Security                                                                                                                   |
| ZB-23         | G12         | Backup and disaster recovery                                                                                               |
| ZB-24         | G04/G12     | Performance                                                                                                                |
| ZB-25         | G06/G08     | Master-data integrity                                                                                                      |
| ZB-26         | G11         | Nine original business simulations plus protected real-component qualification                                             |
| ZB-27         | G11/G12     | Adversarial testing                                                                                                        |
| ZB-28         | G12/G13     | Operations readiness                                                                                                       |
| ZB-29         | G13         | CP P13 certification replaced by current governed Gate D/E specific production acceptance; preserve residual P13 scenarios |

## Additional preservation

The original 57-domain capability inventory remains the business demand source in the historical plan; no invented canonical Shared capability keys. The original nine ZB-26 simulations are retained individually, and augmented with native authorisation, independent legal/providing evidence and negative tests. All old P0/P1/P2 priority declarations are reinterpreted by _release scope_ and the v2.0 execution register; never assume a platform-wide complete P13 based solely on a single test. The old 'Uganda source/SA sell' fixed-role model is rejected as the historical plan already requires. The original aspirational launch checklist must not be read as actual PASS states. Old wine examples are conditional, not trading permission.
