import ConsentPage from "@/components/login/consent";

interface PageProps {
  searchParams: Promise<{ consent_challenge?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const { consent_challenge } = params;
  
  return <ConsentPage consent_challenge={consent_challenge} />;
}