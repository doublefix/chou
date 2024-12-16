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
    
    return "/";
  } catch (error) {
    throw error;
  }
}