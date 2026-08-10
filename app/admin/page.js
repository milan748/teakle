import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import AdminDashboard from './AdminDashboard';

export default async function AdminPage() {
  const session = await getSession();

  if (!session) {
    redirect('/admin/login');
  }

  return <AdminDashboard admin={session} />;
}
