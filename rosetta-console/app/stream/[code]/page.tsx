import { Suspense } from "react";
import StreamDetailClient from "@/components/StreamDetailClient";
import { Skeleton } from "@/components/ui/skeleton";

export default function StreamPage({ params }: { params: { code: string } }) {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-6">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    }>
      <StreamDetailClient streamCode={params.code.toUpperCase()} />
    </Suspense>
  );
}