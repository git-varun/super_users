import { NextRequest, NextResponse } from 'next/server';
import { getPriceHistory } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sku = searchParams.get('sku');
    const daysParam = searchParams.get('days');

    if (!sku) {
      return NextResponse.json(
        { error: 'Missing required parameter: sku' },
        { status: 400 }
      );
    }

    const days = daysParam ? parseInt(daysParam, 10) : 30;

    if (isNaN(days) || days < 1) {
      return NextResponse.json(
        { error: 'Invalid days parameter' },
        { status: 400 }
      );
    }

    const history = await getPriceHistory(sku, days);

    return NextResponse.json({
      sku,
      days,
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error('Price history API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
