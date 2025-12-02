import type { ReactNode } from 'react';

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <div 
      className={`inline-flex items-center justify-start gap-2 p-1 bg-gray-100 rounded-lg overflow-x-auto ${className}`}
      role="tablist"
    >
      {children}
    </div>
  );
}