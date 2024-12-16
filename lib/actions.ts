import { redirect } from "next/navigation";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  const formObject: { [key: string]: string } = {};
  formData.forEach((value, key) => {
    formObject[key] = value as string;
  });
  console.log(formObject.email);
  console.log(formObject.password);

  const response = await fetch("/api/v1/token/access", {
    method: "POST",
    body: JSON.stringify({
      uname: formObject.email,
      passwd: formObject.password,
    }),
  });

  console.log(response.ok);
  if (response.ok) {
    redirect("/");
  } else {
    return "登录失败，请检查您的凭证。";
  }
}
