import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        if (!credentials) {
          throw new Error("Credentials are missing.");
        }
        console.log("Email:", credentials.email);
        console.log("Password:", credentials.password);

        // let user = null
 
        // // logic to salt and hash password
        // const pwHash = saltAndHashPassword(credentials.password)
 
        // // logic to verify if the user exists
        // user = await getUserFromDb(credentials.email, pwHash)
 
        // 模拟一个用户对象
        const mockUser = {
          email: "codepapercut@gmail.com",
          password: "123",  // 这里硬编码了密码
          name: "Test User",
          id: "1",
        };

        // 模拟的用户名和密码验证
        if (credentials.email !== mockUser.email || credentials.password !== mockUser.password) {
          throw new Error("Invalid credentials.");
        }

        // 如果验证通过，返回用户对象
        return mockUser;  // 这里返回的是模拟的用户数据
      },
    }),
  ],
})