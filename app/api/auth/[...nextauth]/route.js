// import { connectMongoDB } from "@/lib/mongodb";
// import User from "@/models/user";
// import NextAuth from "next-auth/next";
// import CredentialsProvider from "next-auth/providers/credentials";
// import bcrypt from "bcryptjs";

// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "credentials",
//       credentials: {},

//       async authorize(credentials) {
//         const { Email, Password } = credentials;

//         try {
//           await connectMongoDB();
//           const user = await User.findOne({ Email });

//           if (!user) {
//             console.log("User not found");
//             return null;
//           }

//           const passwordsMatch = await bcrypt.compare(Password, user.Password);

//           if (!passwordsMatch) {
//             return null;
//           }

//           return user;
//         } catch (error) {
//           console.log("Error: ", error);
//         }
//       },
//     }),
//   ],
//   session: {
//     strategy: "jwt",
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   pages: {
//     signIn: "/",
//   },
// };

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };


import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},

      async authorize(credentials) {
        const { Email, Password } = credentials;

        try {
          await connectMongoDB();
          const user = await User.findOne({ Email });

          if (!user) {
            console.log("User not found");
            return null;
          }

          const passwordsMatch = await bcrypt.compare(Password, user.Password);

          if (!passwordsMatch) {
            return null;
          }

          // Return user object with relevant fields
          return {
            id: user._id,
            FirstName: user.FirstName,
            Email: user.Email,
          };
        } catch (error) {
          console.log("Error: ", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.FirstName = user.FirstName;
        token.Email = user.Email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.FirstName = token.FirstName;
        session.user.Email = token.Email;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
