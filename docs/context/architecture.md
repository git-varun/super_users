# Architecture

## Technical Strategy
- **Orchestrated Search**: Split execution into two phases to bridge the "Performance GAP":
  - **Phase 1 (Classify & Route)**: Fast AI classification of intent and routing to relevant platform tasks via the **Provider Registry**.
  - **Phase 2 (Atomic Search)**: Parallel platform-specific sniffing/scraping using modular **Platform Providers**.
- **Provider Pattern**: Scrapers are decoupled into individual modules in `/lib/providers/`, enabling universal scaling and granular platform selection.
- **Semantic Matching**: Utilizes **Supabase Vector DB** and Gemini Embeddings for resilient SKU matching.

## Tech Stack
- **Framework**: Next.js 16.2.5 (App Router)
- **Library**: React 19.2.4
- **AI/ML**: @google/generative-ai (Gemini 1.5 Flash for SKU matching)
- **Database**: Supabase (PostgreSQL + pgvector for semantic search & price history)
- **Caching**: Upstash Redis (Session & Search Caching)
- **Styling**: Tailwind CSS 4 (Mobile-first UI with Glow/Glassmorphism effects)
- **Language**: TypeScript 5
- **Infrastructure**: Vercel (Hosting)

## Supported Platforms
- **Grocery**: Blinkit, Zepto
- **Marketplace**: Amazon, Flipkart
- **Fashion & Lifestyle**: Myntra, Nykaa, Uniqlo, H&M, Adidas, Puma

## Directory Structure
- `/app`: Next.js App Router pages and layouts.
- `/components`: Shared React components.
- `/lib/providers`: Individual platform scraping/sniffing modules.
- `/lib/registry.ts`: Central registry for platform management and metadata.
- `/docs/context`: Agent project memory.
