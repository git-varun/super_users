/**
 * Price Snapshot Cron Job
 * Runs every 8 hours to capture current prices from all platforms
 * Integrates with existing comparePrice function
 */

import { comparePrice } from '@/app/actions';

const POPULAR_PRODUCTS = [
  'iPhone 15',
  'MacBook Pro',
  'Samsung Galaxy S24',
  'iPad Pro',
  'AirPods Pro',
  'Nike Air Max',
  'Adidas Ultraboost',
  'Dell XPS 13',
  'Asus ROG Gaming Laptop',
  'Sony WH-1000XM5',
  'Canon EOS R5',
  'GoPro Hero 12',
  'DJI Mavic 3',
  'Kindle Paperwhite',
  'Nintendo Switch OLED'
];

export async function takePriceSnapshot() {
  console.log('🚀 Starting price snapshot job at', new Date().toISOString());
  
  let successCount = 0;
  let errorCount = 0;

  for (const product of POPULAR_PRODUCTS) {
    try {
      console.log(`📸 Capturing prices for: ${product}`);
      
      // Call comparePrice which now records prices to DB
      await comparePrice(product, 'general');
      successCount++;
      
      // Add small delay to avoid overwhelming platforms
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Failed to snapshot ${product}:`, error);
      errorCount++;
    }
  }

  console.log(`✅ Price snapshot complete. Success: ${successCount}, Errors: ${errorCount}`);
  
  return {
    success: successCount,
    errors: errorCount,
    total: POPULAR_PRODUCTS.length,
    timestamp: new Date().toISOString()
  };
}

// This will be called by GitHub Actions workflow
if (require.main === module) {
  takePriceSnapshot().then(result => {
    console.log('Job result:', result);
    process.exit(result.errors === 0 ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
