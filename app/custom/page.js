import CustomClient from './CustomClient';

export const metadata = {
  title: 'Custom Orders',
  description: 'Commission a custom teak piece. Tell us what you need and we\'ll build it by hand in solid teak.',
  openGraph: { title: 'Custom Orders \u2014 Teakle', description: 'Commission a custom teak piece. Tell us what you need and we\'ll build it by hand in solid teak.' },
  alternates: { canonical: 'https://teakle.in/custom' },
};

export default function CustomPage() {
  return <CustomClient />;
}
