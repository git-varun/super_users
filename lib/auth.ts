import { supabase } from "./db";
import { sendMagicLinkEmail } from "./email";
import crypto from "crypto";

/**
 * Generate a random token for magic link
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Send magic link to user email
 */
export async function sendMagicLink(email: string): Promise<{ success: boolean; message: string }> {
  if (!email || !email.includes("@")) {
    return { success: false, message: "Invalid email address" };
  }

  if (!supabase) {
    return { success: false, message: "Database not configured" };
  }

  try {
    // Generate token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store in database
    const { error } = await supabase.from("auth_sessions").upsert(
      {
        email,
        token,
        expires_at: expiresAt.toISOString(),
      },
      { onConflict: "email" }
    );

    if (error) {
      console.error("Auth session error:", error);
      return { success: false, message: "Failed to create session" };
    }

    // Create magic link
    const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

    // Send email
    const emailSent = await sendMagicLinkEmail(email, magicLink);

    if (!emailSent) {
      return { success: false, message: "Failed to send email" };
    }

    return {
      success: true,
      message: "Magic link sent to your email",
    };
  } catch (error) {
    console.error("Send magic link error:", error);
    return { success: false, message: "Something went wrong" };
  }
}

/**
 * Verify magic link token
 */
export async function verifyMagicLink(
  token: string,
  email: string
): Promise<{ success: boolean; message: string; session?: any }> {
  if (!token || !email) {
    return { success: false, message: "Missing token or email" };
  }

  if (!supabase) {
    return { success: false, message: "Database not configured" };
  }

  try {
    // Get session from database
    const { data, error } = await supabase
      .from("auth_sessions")
      .select("*")
      .eq("email", email)
      .eq("token", token)
      .single();

    if (error) {
      console.error("Verify token error:", error);
      return { success: false, message: "Invalid or expired token" };
    }

    if (!data) {
      return { success: false, message: "Session not found" };
    }

    // Check if token expired
    const expiresAt = new Date(data.expires_at);
    if (expiresAt < new Date()) {
      return { success: false, message: "Token expired" };
    }

    // Session is valid
    return {
      success: true,
      message: "Authentication successful",
      session: {
        email: data.email,
        createdAt: data.created_at,
      },
    };
  } catch (error) {
    console.error("Verify magic link error:", error);
    return { success: false, message: "Authentication failed" };
  }
}

/**
 * Get session from token (for API routes)
 */
export async function getSessionFromToken(token: string) {
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase
      .from("auth_sessions")
      .select("*")
      .eq("token", token)
      .single();

    if (error || !data) {
      return null;
    }

    // Check if expired
    const expiresAt = new Date(data.expires_at);
    if (expiresAt < new Date()) {
      return null;
    }

    return {
      email: data.email,
      token: data.token,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
}

/**
 * Logout user by deleting session
 */
export async function logout(email: string): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("auth_sessions").delete().eq("email", email);

    if (error) {
      console.error("Logout error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(token: string): Promise<boolean> {
  const session = await getSessionFromToken(token);
  return session !== null;
}
