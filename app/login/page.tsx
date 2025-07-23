import LoginPage from "@/components/login/simple";

export default async function Page({
  searchParams,
}: {
  searchParams: { login_challenge?: string };
}) {
  const { login_challenge } = await Promise.resolve(searchParams);
  return <LoginPage loginChallenge={login_challenge} />;
}