import "./globals.css";
import { Providers } from "@/components/Providers";
import Link from "next/link";

export const metadata = {
  title: "Rosetta Console",
  description: "Expose fiction vs reality, connect drivers to outcomes, and show dollars clearly."
};

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Organization', href: '/org' },
  { name: 'Streams', href: '/streams' },
  { name: 'Truth', href: '/truth' },
  { name: 'Evidence', href: '/evidence' },
  { name: 'KPIs', href: '/kpis' },
  { name: 'Finance', href: '/finance' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
              <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2">
                      <span className="font-bold text-lg">Rosetta Console</span>
                      <span className="text-sm text-gray-500">v4.0</span>
                    </Link>
                    <div className="hidden md:flex items-center space-x-4">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Everything visible. Everything editable. Real-time impact.
                  </div>
                </div>
              </div>
            </nav>
            <main className="container mx-auto px-4 py-6">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}