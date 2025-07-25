import ConsentPage from "@/components/login/consent";

export default async function Page({
  searchParams,
}: {
  searchParams: { login_challenge?: string };
}) {
  const { login_challenge } = await Promise.resolve(searchParams);
  return <ConsentPage loginChallenge={login_challenge} />;
}