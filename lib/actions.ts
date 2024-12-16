export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
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

  if (response.ok) {
    const data = await response.json();
    if (data.redirect) {
      window.location.href = data.redirect;
    }
  } else {
    return "登录失败，请检查您的凭证。";
  }
}
