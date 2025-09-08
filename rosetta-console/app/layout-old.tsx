import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Rosetta Console",
  description: "Expose fiction vs reality, connect drivers to outcomes, and show dollars clearly."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-white border-b border-gray-200">
          <div className="container flex items-center gap-6 py-3">
            <span className="font-bold text-brand-700">Rosetta Console</span>
            <Link className="hover:text-brand-700" href="/org">Org</Link>
            <Link className="hover:text-brand-700" href="/streams">Streams</Link>
            <Link className="hover:text-brand-700" href="/truth">Truth</Link>
            <Link className="hover:text-brand-700" href="/evidence">Evidence</Link>
            <Link className="hover:text-brand-700" href="/kpis">KPIs</Link>
            <Link className="hover:text-brand-700" href="/finance">Finance</Link>
          </div>
        </nav>
        <main className="container py-6">{children}</main>
      </body>
    </html>
  );
}
