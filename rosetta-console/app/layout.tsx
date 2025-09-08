import "./globals.css";

export const metadata = {
  title: "Rosetta Console",
  description: "Expose fiction vs reality, connect drivers to outcomes, and show dollars clearly."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-white border-b border-gray-200">
          <div className="container flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-brand-700 text-lg">Rosetta Console</span>
              <span className="text-sm text-gray-500">Business Intelligence Dashboard</span>
            </div>
            <div className="text-sm text-gray-600">
              Everything visible. Everything editable. Real-time impact.
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}