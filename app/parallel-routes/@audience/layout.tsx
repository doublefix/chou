import { Boundary } from '@/components/ui/test/boundary';
import { TabGroup } from '@/components/ui/test/tab-group';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Boundary labels={['parallel-routes/@audience/layout.tsx']} size="small">
      <div className="space-y-8">
        <TabGroup
          path="/parallel-routes"
          items={[
            {
              text: 'Home',
            },
            {
              text: 'Demographics',
              slug: 'demographics',
            },
            {
              text: 'Subscribers',
              slug: 'subscribers',
            },
          ]}
        />

        {children}
      </div>
    </Boundary>
  );
}
