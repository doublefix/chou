import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { z } from "zod";
// import bcrypt from "bcrypt";

const mockUser = {
  id: "123",
  email: "user@example.com",
  password: "$2b$10$O1KNBZBlD6UcsRpg9ZP7Le9FGcHgbV1YNkEBwquExuwjhtROOgoZG", // 经过bcrypt加密的密码
};

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          if (email === mockUser.email) {
            // const passwordsMatch = await bcrypt.compare(
            //   password,
            //   mockUser.password
            // );

            return mockUser;

            // if (passwordsMatch) {
            // }
          }
        }

        console.log("Invalid credentials");
        return null;
      },
      credentials: {},
    }),
  ],
});
