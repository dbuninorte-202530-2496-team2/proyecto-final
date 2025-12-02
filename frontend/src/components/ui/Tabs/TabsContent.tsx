import type { ReactNode } from 'react';
import { useTabsContext } from './TabsContext';

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className = '' }: TabsContentProps) {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) {
    return null;
  }

  return (
    <div 
      role="tabpanel"
      className={`animate-fadeIn ${className}`}
    >
      {children}
    </div>
  );
}