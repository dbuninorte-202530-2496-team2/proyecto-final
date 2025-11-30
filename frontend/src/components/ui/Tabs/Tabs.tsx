import type { ReactNode } from 'react';
import { TabsProvider } from './TabsContext';

interface TabsProps {
  defaultValue: string;
  children: ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, children, className = '' }: TabsProps) {
  return (
    <TabsProvider defaultValue={defaultValue}>
      <div className={`space-y-4 ${className}`}>
        {children}
      </div>
    </TabsProvider>
  );
}