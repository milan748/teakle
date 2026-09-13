// Editor nested layout — adds editor-specific metadata
// The root layout handles <html>, <body>, and conditionally hides Header/Footer for /admin/editor routes

export const metadata = {
  title: 'Page Editor — Teakle Admin',
  robots: { index: false, follow: false },
}

export default function EditorLayout({ children }) {
  return children
}
