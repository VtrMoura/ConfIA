import { cn } from '@/lib/utils';
import { DivideIcon as LucideIcon } from 'lucide-react';
import type { LucideProps } from "lucide-react";

interface EmptyStateProps {
  icon: React.ComponentType<LucideProps>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <Icon className="h-10 w-10" />
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}