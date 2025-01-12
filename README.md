This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
# 创建项目
npx create-next-app@latest

npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev

# 打包
pnpm build

```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



```bash
# 侧边栏
https://ui.shadcn.com/blocks/sidebar
https://ui.shadcn.com/docs/components/sidebar#structure

# 路由参考
https://app-router.vercel.app/

# 状态管理 zustand

# Test

# 调用接口401就返回到login
# 	1.	后端返回 401：当后端检测到 Token 无效 或 过期 时，返回 401 错误，前端捕获后跳转到登录页面。
# 	2.	前端 Token 检查：前端在每次加载受保护页面时，检查 Token 是否存在 和 有效性，如果无效则跳转到登录页面。

#  前端：nextjs,后端：nextjs+nodejs,gin
# 在未渲染之前询问后端是否拥有权限进行渲染，后端的这个接口做redis缓存优化,前端使用zustand做缓存优化
# SSR,CSR,SEO
# SSR 可以在服务器端生成完整的 HTML 页面，这对于搜索引擎爬虫来说非常友好，因为它们通常不能执行 JavaScript 代码。如果页面在服务器端渲染，爬虫就能直接读取到完整的内容，提升 SEO 排名。
# 在 Next.js 服务端渲染（SSR） 阶段向后端询问用户权限，并基于返回的结果决定是否渲染页面，是符合 Next.js 和 前端业界规范 的，同时也符合前后端分离的常见实践。

server {
  listen 80;
  server_name yourdomain.com;

  # Static files from Next.js export
  location / {
    root /path/to/your/nextjs/out;
    try_files $uri $uri/ /index.html;
  }

  # Proxy API and SSR requests
  location /_next/ {
    proxy_pass http://localhost:3000;  # Next.js Node.js server
  }
  
  location /api/ {
    proxy_pass http://localhost:3000;  # API Gin
  }
}
```


## 项目部署
http+https+ci
https://stackoverflow.com/questions/64386737/how-to-deploy-nextjs-with-nginx
