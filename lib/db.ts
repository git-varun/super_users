import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "./db-admin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Standard Supabase Client (Public)
 * Respects RLS. Safe for use in components if needed (but prefer server actions).
 */
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Insert or update price history record
 * Uses admin client to bypass RLS for history recording
 */
export async function recordPrice(
  productSku: string,
  platform: string,
  price: number,
  timestamp: Date = new Date()
) {
  const { error } = await supabaseAdmin.from("price_history").insert({
    product_sku: productSku,
    platform,
    price,
    recorded_at: timestamp.toISOString(),
  });

  if (error) {
    console.error("Price history insert error:", error);
  }
}

/**
 * Get price history for a SKU
 */
export async function getPriceHistory(
  productSku: string,
  days: number = 30
) {
  const { data, error } = await supabaseAdmin
    .from("price_history")
    .select("*")
    .eq("product_sku", productSku)
    .gte("recorded_at", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .order("recorded_at", { ascending: true });

  if (error) {
    console.error("Get price history error:", error);
    return [];
  }

  return data || [];
}

/**
 * Create a price watch
 */
export async function createPriceWatch(
  productUrl: string,
  productName: string,
  targetPrice: number,
  userEmail: string
) {
  const { data, error } = await supabaseAdmin
    .from("price_watches")
    .insert({
      product_url: productUrl,
      product_name: productName,
      target_price: targetPrice,
      user_email: userEmail,
      created_at: new Date().toISOString(),
      notified: false,
    })
    .select();

  if (error) {
    console.error("Create price watch error:", error);
    throw error;
  }

  return data?.[0] || null;
}

/**
 * Get all active price watches
 */
export async function getActivePriceWatches() {
  const { data, error } = await supabaseAdmin
    .from("price_watches")
    .select("*")
    .eq("notified", false);

  if (error) {
    console.error("Get price watches error:", error);
    return [];
  }

  return data || [];
}

/**
 * Mark a watch as notified
 */
export async function markWatchNotified(watchId: number) {
  const { error } = await supabaseAdmin
    .from("price_watches")
    .update({ notified: true })
    .eq("id", watchId);

  if (error) {
    console.error("Mark watch notified error:", error);
  }
}

/**
 * Store product embeddings for Look Alike feature
 */
export async function storeProductEmbedding(
  productSku: string,
  embedding: number[]
) {
  const { error } = await supabaseAdmin.from("product_embeddings").upsert(
    {
      product_sku: productSku,
      embedding: embedding,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "product_sku" }
  );

  if (error) {
    console.error("Store embedding error:", error);
  }
}

/**
 * Cache coupons in database
 */
export async function cacheCoupons(coupons: any[]) {
  const { error } = await supabaseAdmin.from("coupons").insert(coupons);

  if (error) {
    console.error("Cache coupons error:", error);
  }
}

/**
 * Get applicable coupons for a product
 */
export async function getApplicableCoupons(
  platform: string,
  productCategory?: string
) {
  let queryBuilder = supabaseAdmin.from("coupons").select("*").eq("platform", platform);

  if (productCategory) {
    queryBuilder = queryBuilder.filter("category", "ilike", `%${productCategory}%`);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    console.error("Get coupons error:", error);
    return [];
  }

  return data || [];
}
