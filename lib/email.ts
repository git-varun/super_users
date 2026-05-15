import sgMail from "@sendgrid/mail";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@sense-savings.app";

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send a generic email via SendGrid
 */
export async function sendEmail(email: EmailPayload): Promise<boolean> {
  if (!SENDGRID_API_KEY) {
    console.error("❌ SendGrid API key not configured");
    return false;
  }

  try {
    await sgMail.send({
      to: email.to,
      from: FROM_EMAIL,
      subject: email.subject,
      html: email.html,
      text: email.text || email.html.replace(/<[^>]*>/g, ""),
    });

    console.log(`✅ Email sent to ${email.to}`);
    return true;
  } catch (error) {
    console.error("❌ SendGrid Error:", error);
    return false;
  }
}

/**
 * Send price alert email when target price is reached
 */
export async function sendPriceAlertEmail(
  userEmail: string,
  productName: string,
  targetPrice: number,
  currentPrice: number,
  productLink: string,
  platform: string
) {
  const savings = targetPrice - currentPrice;
  const savingsPercent = Math.round((savings / targetPrice) * 100);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0a0a0a 0%, #111111 100%); color: #00ff9d; padding: 20px; border-radius: 12px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">🎉 Price Alert!</h1>
      </div>

      <div style="padding: 20px; background: #f9f9f9; border-radius: 12px; margin-top: 20px;">
        <h2 style="color: #333; margin-top: 0;">${productName}</h2>
        
        <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0; color: #666;">Platform: <strong>${platform}</strong></p>
          <p style="margin: 5px 0; color: #666;">Target Price: <span style="text-decoration: line-through;">₹${targetPrice.toLocaleString()}</span></p>
          <p style="margin: 5px 0; font-size: 24px; color: #00ff9d; font-weight: bold;">
            Current Price: ₹${currentPrice.toLocaleString()}
          </p>
          <p style="margin: 5px 0; color: #00d4ff; font-weight: bold;">
            You Save: ₹${savings.toLocaleString()} (${savingsPercent}% off!)
          </p>
        </div>

        <p style="color: #666; text-align: center;">
          The price has dropped below your target. Don't miss out!
        </p>

        <div style="text-align: center; margin: 20px 0;">
          <a href="${productLink}" 
             style="display: inline-block; padding: 12px 30px; background: #00ff9d; color: black; text-decoration: none; border-radius: 8px; font-weight: bold;">
            View Product
          </a>
        </div>
      </div>

      <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: center; color: #999; font-size: 12px;">
        <p style="margin: 5px 0;">This is an automated alert from SENSE Savings Engine</p>
        <p style="margin: 5px 0;">
          <a href="https://sense-savings.app" style="color: #00ff9d; text-decoration: none;">Manage Alerts</a>
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    subject: `✨ Price Alert: ${productName} now ₹${currentPrice.toLocaleString()}`,
    html,
  });
}

/**
 * Send magic link login email
 */
export async function sendMagicLinkEmail(
  userEmail: string,
  magicLink: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0a0a0a 0%, #111111 100%); color: #00ff9d; padding: 20px; border-radius: 12px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">SENSE Savings Engine</h1>
      </div>

      <div style="padding: 20px; background: #f9f9f9; border-radius: 12px; margin-top: 20px;">
        <h2 style="color: #333;">Secure Login Link</h2>
        
        <p style="color: #666;">
          Click the button below to login to your SENSE account:
        </p>

        <div style="text-align: center; margin: 20px 0;">
          <a href="${magicLink}" 
             style="display: inline-block; padding: 12px 30px; background: #00ff9d; color: black; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Login to SENSE
          </a>
        </div>

        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          Or copy this link: <br>
          <code style="background: #eee; padding: 5px; border-radius: 4px;">${magicLink}</code>
        </p>

        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          This link expires in 24 hours. If you didn't request this, please ignore.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    subject: "Your SENSE Login Link",
    html,
  });
}

/**
 * Send coupon notification email
 */
export async function sendCouponNotificationEmail(
  userEmail: string,
  productName: string,
  couponCode: string,
  discount: string,
  platform: string,
  productLink: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0a0a0a 0%, #111111 100%); color: #00ff9d; padding: 20px; border-radius: 12px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">💰 Coupon Available!</h1>
      </div>

      <div style="padding: 20px; background: #f9f9f9; border-radius: 12px; margin-top: 20px;">
        <h2 style="color: #333;">${productName}</h2>
        
        <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border: 2px solid #00ff9d;">
          <p style="margin: 0; color: #666; font-size: 12px;">Use this code on ${platform}:</p>
          <p style="margin: 10px 0; font-size: 24px; color: #00ff9d; font-weight: bold; text-align: center;">
            ${couponCode}
          </p>
          <p style="margin: 0; color: #666; font-size: 12px; text-align: center;">Save: ${discount}</p>
        </div>

        <div style="text-align: center; margin: 20px 0;">
          <a href="${productLink}" 
             style="display: inline-block; padding: 12px 30px; background: #00ff9d; color: black; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Shop Now
          </a>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    subject: `🎉 Coupon: ${discount} on ${productName}`,
    html,
  });
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(userEmail: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0a0a0a 0%, #111111 100%); color: #00ff9d; padding: 20px; border-radius: 12px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">Welcome to SENSE</h1>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #00d4ff;">Stop overpaying. Compare 10+ platforms in seconds.</p>
      </div>

      <div style="padding: 20px; background: #f9f9f9; border-radius: 12px; margin-top: 20px;">
        <h2 style="color: #333;">Get Started</h2>
        
        <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Features You Can Use:</h3>
          <ul style="color: #666; line-height: 1.8;">
            <li><strong>Price Tracking:</strong> Watch prices and get alerts when they drop</li>
            <li><strong>Auto Coupons:</strong> Find best coupon codes automatically</li>
            <li><strong>Price Comparison:</strong> Compare 10+ platforms instantly</li>
            <li><strong>Look Alike:</strong> Discover similar products with better deals</li>
            <li><strong>Bank Offers:</strong> See all applicable bank/card discounts</li>
          </ul>
        </div>

        <p style="color: #666;">
          Start searching for products to compare prices and find the best deals!
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    subject: "Welcome to SENSE - Your Savings Engine",
    html,
  });
}
