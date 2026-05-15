# Project Overview: Real-Time Savings Engine

The "Sense" of this project is to build a **Real-Time Savings Engine for the Indian consumer**—essentially a "Google Search for Prices" that solves platform fragmentation (Blinkit vs. Zepto vs. Amazon vs. Myntra vs. Nykaa).

## Core Value Proposition
- **The Problem**: Rapidly changing prices due to stock, location (NCR), and flash sales across 10+ apps.
- **The Solution**: A unified Next.js app that "sniffs" live data to present the **Cheapest Landing Price** (Product + Delivery - Discounts) in ~3 seconds.
- **User Control**: Enables users to selectively choose which platforms to compare, providing flexibility for those with specific platform preferences or loyalty.

## Intelligent Comparison Engine
The project leverages **Gemini AI** to transform raw data into structured insights:
- **Orchestrated Streaming**: Searches are split into two phases (Intent Classification & Platform Routing -> Atomic Platform Tasks) to deliver results in real-time.
- **Provider Registry**: A centralized registry manages modular **Platform Providers**, supporting universal scaling and self-describing metadata.
- **Granular Selection**: Users can customize their search sources via a platform selector, which is respected throughout the search lifecycle.
- **Selective Routing**: Queries are intelligently routed to relevant platforms based on intent (e.g., Fashion, Grocery).
- **Price Trend Sniffing**: Every price check is recorded to build a historical map, enabling "Price Drop" alerts.
- **Fuzzy Matching**: Uses semantic vector embeddings (Supabase Vector DB) for resilient SKU matching.

## "Hybrid" Execution Strategy
- **Regex/JSON/GraphQL**: Used for fast price and image extraction via direct API calls.
- **Puppeteer**: Used for legacy scraping of platforms without accessible APIs.
- **Gemini**: Used for high-level "Matching" and "Categorization" to avoid "Data Mapping Hell."
- **Caching**: Redis is utilized to cache AI responses for 12 hours to reduce latency and costs.
