import { getAuthContext } from '../components/auth-context';

export const fetcher = async (url: string) => {
  const res = await fetch(url);

  const { redirectToLogin } = getAuthContext();

  if (res.status === 401) {
    redirectToLogin();
  }

  if (!res.ok) {
    throw new Error('An error occurred while fetching data');
  }

  return res.json();
};