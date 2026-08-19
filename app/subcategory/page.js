import SubcategoryClient from './SubcategoryClient';
import { PRODUCTS } from '../data/products';

export const metadata = {
  title: 'Shop',
  description: 'Browse Teakle solid teak products by category. Handcrafted furniture and objects for every room.',
  openGraph: { title: 'Shop \u2014 Teakle', description: 'Browse Teakle solid teak products by category.' },
  alternates: { canonical: 'https://teakle.in/subcategory' },
};

export default function SubcategoryPage() {
  return <SubcategoryClient products={PRODUCTS} />;
}
