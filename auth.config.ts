import type { NextAuthOptions } from 'next-auth';

export const authConfig: NextAuthOptions = {
  pages: {
    signIn: '/login', // 自定义登录页面
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      const isLoggedIn = !!url; // 假设你通过 `url` 参数来判断是否登录
      const isOnDashboard = url.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return url; // 已登录用户保持当前 URL
        return '/login'; // 未登录用户跳转到登录页
      } else if (isLoggedIn) {
        return '/dashboard'; // 已登录用户跳转到仪表板
      }
      return baseUrl;
    },
  },
  providers: [],
};

export default authConfig;