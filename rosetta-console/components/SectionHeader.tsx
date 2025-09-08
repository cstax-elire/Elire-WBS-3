export default function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      {subtitle && <p className="text-gray-600">{subtitle}</p>}
    </div>
  );
}
