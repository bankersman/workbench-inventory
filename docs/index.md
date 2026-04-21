---
layout: home

hero:
  name: Workbench Inventory
  text: Workshop stock, BOM, and kiosk scanning
  tagline: A self-hosted NestJS + React stack — SQLite on the bench, Docker or native on a Pi, optional USB scanner and label printing.
  image:
    src: /hero-icon.svg
    alt: ''
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started/
    - theme: alt
      text: Docker images
      link: /guide/docker
    - theme: alt
      text: Configuration
      link: /guide/configuration

features:
  - icon: 📦
    title: Projects & BOM
    details: Import BOM CSVs, track pull and install progress, export shopping lists for Mouser and TME.
  - icon: 🖥️
    title: Kiosk-first UI
    details: Touch-friendly React UI with an on-screen command palette — same flows as a serial scanner when you want them.
  - icon: 🔌
    title: USB scanner
    details: USB serial (CDC) barcode input with line-terminated reads — optional until you configure SCANNER_PORT.
  - icon: 🏷️
    title: Labels
    details: Code 128 labels rendered as PNG; optional Brother QL hardware via @brother-ql/node when you need physical prints.
  - icon: 💾
    title: SQLite & backups
    details: Single-file database with scheduled backups and optional rsync to a NAS path.
  - icon: 🐳
    title: Docker or native
    details: Multi-arch images on GHCR, or run under systemd on a Raspberry Pi with the included unit example.
---

## Quick links

| I want to…                    | Go to                                                |
| ----------------------------- | ---------------------------------------------------- |
| Clone & run with Compose      | [Getting started](/guide/getting-started/)           |
| Pull pre-built images         | [Docker (GHCR)](/guide/docker)                       |
| Env vars and paths            | [Configuration](/guide/configuration)                |
| Brother QL labels             | [Brother QL label printing](/guide/hardware/printers) |
| USB scanner in Docker         | [USB barcode scanner](/guide/hardware/scanner)       |
| Deploy on a Pi without Docker | [Raspberry Pi (native)](/guide/raspberry-pi-native)  |
