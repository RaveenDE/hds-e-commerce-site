# HDS Engineering & Contractors

Company site and e-commerce UI for **HDS Engineering & Contractors** — professionals in Stainless Steel Fabrication, Hotel & Bakery Equipment, Steel Fabrication, Elevator Renovation, and Elevator Interior Solutions.

## Features

- **Home page** — Hero, services (Stainless Steel Fabrication, Hotel & Bakery Equipment, Steel Fabrication, Elevator Renovation, Elevator Interior Solution), about, and CTA
- **Kitchenware shop** — Stainless steel kitchen products with category filters and product cards
- **Brand styling** — HDS logo colors (navy `#213570`, light background), Outfit + DM Serif Display fonts, responsive layout

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Logo

To use your own logo image, place it in `public/logo.png` and update the Header component to render `<img src="/logo.png" alt="HDS" />` inside the logo link. The current header uses styled text that matches the HDS brand.
