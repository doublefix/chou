import { Boundary } from '@/components/ui/test/boundary';
import { TabNavItem } from '@/components/ui/test/tab-nav-item';
import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Boundary
      labels={['checkout layout']}
      color="blue"
      animateRerendering={false}
    >
      <div className="space-y-9">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-4">
            <TabNavItem href="/route-groups">Back</TabNavItem>
          </div>
        </div>

        <div>{children}</div>
      </div>
    </Boundary>
  );
}
