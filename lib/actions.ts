import { signIn } from "@/auth";
import NextAuthError from "next-auth";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    // 打印 formData 转换成普通对象
    const formObject: { [key: string]: string } = {};
    formData.forEach((value, key) => {
      formObject[key] = value as string;
    });
    console.log("FormData:", formObject); // 打印 formData

    // await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof NextAuthError) {
      switch (error) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}