# Implementation progress

Specification: [PLAN.md](./PLAN.md). Check off each step when it is complete.

---

## Phase 1 — Foundation

**Goal:** NestJS running, SQLite connected via TypeORM, schema migrated, seed data loaded, health check responding, all code quality tooling configured and passing.

_Status: complete._

- [x] Step 1.1 — Project scaffold and tooling
- [x] Step 1.2 — Entities and migration
- [x] Step 1.3 — Verify

---

## Phase 2 — Core Inventory CRUD

**Goal:** Full create/read/update/delete for storage units, containers, items, categories. Unified barcode scan resolution working.

_Status: complete._

- [x] Step 2.1 — Storage unit module
- [x] Step 2.2 — Container module
- [x] Step 2.3 — Item module
- [x] Step 2.4 — Category module
- [x] Step 2.5 — Unified scan resolution
- [x] Step 2.6 — Availability service

---

## Phase 3 — Scanner Integration

**Goal:** Hardware scanner optional but fully integrated when present. WebSocket gateway running regardless, kiosk command mode accessible without scanner via on-screen UI.

- [ ] Step 3.1 — Serial port service
- [ ] Step 3.2 — WebSocket gateway
- [ ] Step 3.3 — On-screen command palette (scanner-free fallback)

---

## Phase 4 — Frontend Core

**Goal:** React kiosk app, scanner state machine, core navigation and screens working.

- [ ] Step 4.1 — App shell
- [ ] Step 4.2 — Scanner hook and state machine
- [ ] Step 4.3 — Status bar
- [ ] Step 4.4 — Home screen
- [ ] Step 4.5 — Storage unit detail screen
- [ ] Step 4.6 — Container detail screen
- [ ] Step 4.7 — Item detail screen

---

## Phase 5 — Projects and BOM

**Goal:** Full project lifecycle with BOM, availability indicators, pull and install tracking, CSV import and export, shopping list generation.

- [ ] Step 5.1 — Project module
- [ ] Step 5.2 — BOM module
- [ ] Step 5.3 — BOM import
- [ ] Step 5.4 — BOM and order list export
- [ ] Step 5.5 — Projects list screen
- [ ] Step 5.6 — Project detail screen

---

## Phase 6 — Order List and Supplier APIs

**Goal:** Global order list with live supplier data, batch refresh, all export formats.

- [ ] Step 6.1 — Order list module
- [ ] Step 6.2 — Mouser service
- [ ] Step 6.3 — TME service
- [ ] Step 6.4 — Batch refresh
- [ ] Step 6.5 — Order list screen

---

## Phase 7 — Label Printing

**Goal:** Generate and print Code 128 labels for all scannable entities.

- [ ] Step 7.1 — Python sidecar
- [ ] Step 7.2 — Label service
- [ ] Step 7.3 — Label and command sheet endpoints
- [ ] Step 7.4 — Label UI

---

## Phase 8 — Backup

**Goal:** Nightly scheduled backup and manual controls.

- [ ] Step 8.1 — Backup service
- [ ] Step 8.2 — Scheduler
- [ ] Step 8.3 — Backup endpoints and Settings UI section

---

## Phase 9 — Settings, Polish, Resilience

**Goal:** Complete settings screen, all warnings wired, production-stable on Pi.

- [ ] Step 9.1 — Settings screen
- [ ] Step 9.2 — Warning system
- [ ] Step 9.3 — Inactivity timeout
- [ ] Step 9.4 — Resilience
- [ ] Step 9.5 — Second screen QA

---

## Phase 10 — CI/CD and Docker

**Goal:** GitHub Actions pipeline running quality checks on every PR and push. Docker image built and published on release. App runnable via Docker Compose for anyone without a Pi or local Node setup.

- [ ] Step 10.1 — GitHub Actions: CI pipeline
- [ ] Step 10.2 — GitHub Actions: Docker build and publish
- [ ] Step 10.3 — Docker Compose
- [ ] Step 10.4 — Dockerfile

---

## Phase 11 — Documentation and Community

**Goal:** GitHub Pages site with user-facing manual and project info. Contribution guide for open source contributors.

- [ ] Step 11.1 — GitHub Pages site
- [ ] Step 11.2 — Contribution guide (`CONTRIBUTING.md`)
- [ ] Step 11.3 — Supporting repo files
