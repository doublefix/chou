import { Boundary } from '@/components/ui/test/boundary';

export default function Template({ children }: { children: React.ReactNode }) {
  return <Boundary>{children}</Boundary>;
}
