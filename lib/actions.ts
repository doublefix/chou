import { signIn } from "next-auth/react"; // 从 next-auth/react 导入 signIn
import NextAuthError from "next-auth";

// 自定义的登录认证函数
export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    // 将 formData 转换为普通对象
    const formObject: { [key: string]: string } = {};
    formData.forEach((value, key) => {
      formObject[key] = value as string;
    });
    console.log("FormData received:", formData);
    // formData.forEach((value, key) => {
    //   console.log(key, value); // 打印每个键值对
    // });
    console.log(formObject.email)
    console.log(formObject.password)
    
    // 调用 next-auth 的 signIn 方法进行认证
    // const result = await signIn("credentials", {
    //   redirect: false, // 禁用默认重定向
    //   email: formObject.email, // 传递表单中的 email 和 password
    //   password: formObject.password,
    // });

    // if (!result?.ok) {
    //   return "Invalid credentials."; // 登录失败
    // }

    return "/"; // 登录成功后跳转到指定 URL，默认是 "/"
  } catch (error) {
    if (error instanceof NextAuthError) {
      switch (error) {
        case "CredentialsSignin":
          return "Invalid credentials."; // 认证失败时的错误消息
        default:
          return "Something went wrong."; // 其他错误
      }
    }
    throw error; // 其他错误继续抛出
  }
}