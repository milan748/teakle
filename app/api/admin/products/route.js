import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { getAllProducts, clearMetadataCache } from '@/lib/products';

export async function GET(request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    let products = getAllProducts(db);

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p =>
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q))
      );
    }
    if (category) {
      products = products.filter(p => p.category === category);
    }
    if (status === 'active') {
      products = products.filter(p => p.active);
    } else if (status === 'inactive') {
      products = products.filter(p => !p.active);
    }

    const total = products.length;
    const paged = products.slice(offset, offset + limit);

    const data = paged.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      categoryName: p.categoryName,
      price: p.price,
      priceFormatted: p.priceFormatted,
      sku: p.sku,
      active: p.active,
      inventoryQuantity: p.inventoryQuantity,
      isHero: p.isHero,
      image: p.images?.[0] || '',
      availability: p.availability,
    }));

    const categories = [...new Set(getAllProducts(db).map(p => p.category))].sort();

    return NextResponse.json({
      success: true,
      data,
      categories,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Admin products GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
