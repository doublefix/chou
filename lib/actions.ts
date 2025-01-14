export async function authenticate(formData: FormData) {
  const formObject: { [key: string]: string } = {};
  formData.forEach((value, key) => {
    formObject[key] = value as string;
  });

  const response = await fetch("/api/v1/token/access", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: formObject.identifier,
      password: formObject.password,
    }),
  });

  if (!response.ok) {
    throw new Error("登录失败，请检查您的凭证。");
  }

  return await response.json();
}

export async function join(formData: FormData) {
  const formObject: { [key: string]: string } = {};
  formData.forEach((value, key) => {
    formObject[key] = value as string;
  });

  const requestBody: { [key: string]: string } = {
    email: formObject.email,
    password: formObject.password,
  };

  if (formObject.username && formObject.username.trim() !== "") {
    requestBody.username = formObject.username; // 只有非空字符串时添加 username
  }

  const response = await fetch("/api/v1/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  return await response.json();
}

export const logout = async (): Promise<{
  success: boolean;
  redirect?: string;
}> => {
  try {
    const response = await fetch("/api/v1/logout", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      console.error("Failed to log out:", response.statusText);
      return { success: false };
    }

    const data = await response.json();
    return { success: true, redirect: data.redirect };
  } catch (error) {
    console.error("Error logging out:", error);
    return { success: false };
  }
};

export async function checkAvailability(fields: Record<string, string>) {
  const query = new URLSearchParams(fields).toString();
  try {
    const response = await fetch(`/api/v1/users/availability?${query}`);
    if (!response.ok) {
      throw new Error(`Failed to check availability: ${response.statusText}`);
    }
    return await response.json(); // 返回完整响应体
  } catch (error) {
    console.error("Error checking availability:", error);
    throw error;
  }
}

// Todo: Token 刷新机制、前端路由保护
export const fetcher = async <T>(
  url: string,
  options: RequestInit = {}, // 允许传入配置选项
  params?: Record<string, string>, // 可选的查询参数
  body?: T // 可选的请求体
) => {
  // 获取 AuthContext 中的 redirectToLogin 方法
  // const { redirectToLogin } = useAuthContext();

  // 处理查询参数
  const urlWithParams = new URL(url);
  if (params) {
    Object.keys(params).forEach((key) => {
      urlWithParams.searchParams.append(key, params[key]);
    });
  }

  // 准备请求体
  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}), // 保留传入的 headers
    },
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(urlWithParams.toString(), fetchOptions);

    if (res.status === 401) {
      // 401 错误时跳转到登录页面
    }

    if (!res.ok) {
      // 处理其他 HTTP 错误
      throw new Error(`Request failed with status: ${res.status}`);
    }

    const contentType = res.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      return await res.json(); // 返回 JSON 数据
    } else {
      return await res.text(); // 返回纯文本数据（如无 JSON 响应）
    }
  } catch (error) {
    // 网络错误、超时等
    console.error("Fetch error:", error);
    throw error;
  }
};
