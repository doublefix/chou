import { redirect } from 'next/navigation';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    const formObject: { [key: string]: string } = {};
    formData.forEach((value, key) => {
      formObject[key] = value as string;
    });
    console.log(formObject.email)
    console.log(formObject.password)

    // 模拟调用后端接口假设成功了
    const loginSuccessful = true;

    if (loginSuccessful) {
      redirect('/');
    } else {
      return '登录失败，请检查您的凭证。';
    }
  } catch (error) {
    throw error;
  }
}