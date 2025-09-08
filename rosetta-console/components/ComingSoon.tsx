import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import Link from "next/link";

interface ComingSoonProps {
  title: string;
  description: string;
  features?: string[];
}

export default function ComingSoon({ title, description, features }: ComingSoonProps) {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Clock className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-lg mt-2">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              This feature is currently under development
            </p>
          </div>
          
          {features && features.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Planned Features:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="pt-4 text-center">
            <Link 
              href="/"
              className="text-sm text-primary hover:underline"
            >
              ← Return to Dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}