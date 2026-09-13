import { requireAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import EditorClient from '../EditorClient'

const VALID_PAGES = ['home', 'studio', 'contact', 'trade', 'custom', 'journal', 'archive']

export default async function EditorPage({ params }) {
  const { authorized } = await requireAdmin()
  if (!authorized) redirect('/admin/login')
  
  const { page } = await params
  if (!VALID_PAGES.includes(page)) redirect('/admin')
  
  return <EditorClient page={page} />
}
