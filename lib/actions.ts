export async function authenticate(formData: FormData) {
  const formObject: { [key: string]: string } = {};
  formData.forEach((value, key) => {
    formObject[key] = value as string;
  });

  const response = await fetch("/api/v1/token/access", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      uname: formObject.email,
      passwd: formObject.password,
    }),
  });

  if (!response.ok) {
    throw new Error("登录失败，请检查您的凭证。");
  }

  return await response.json();
}