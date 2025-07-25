import ConsentPage from "@/components/login/consent";

export default async function Page({
  searchParams,
}: {
  searchParams: { consent_challenge?: string };
}) {
  const { consent_challenge } = await Promise.resolve(searchParams);
  return <ConsentPage consent_challenge={consent_challenge} />;
}