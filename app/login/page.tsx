import LoginPage from "@/components/login/simple";

interface PageProps {
  searchParams: Promise<{ login_challenge?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const { login_challenge } = params;
  
  return <LoginPage loginChallenge={login_challenge} />;
}