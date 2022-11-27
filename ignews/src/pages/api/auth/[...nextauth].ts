import NextAuth, { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"

// DB
import { query as q } from "faunadb"
import { fauna } from "../../../services/fauna"

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,

      // Scope
      authorization: {
        params: {
          scope: "read:user",
        },
      },
    }),
  ],

  // Callbacks
  callbacks: {
    async signIn({ user }) {
      const { name, email } = user

      try {
        //   await fauna.query(
        //     q.If(
        //       q.Not(
        //         q.Exists(
        //           q.Match(
        //             q.Index("user_by_email"),
        //             q.Casefold(email)
        //           )
        //         )
        //       ),
        //       q.Create(q.Collection("users"), {
        //         data: {
        //           email,
        //           name,
        //         },
        //       }),
        //       q.Get(
        //         q.Match(
        //           q.Index("user_by_email"),
        //           q.Casefold(email)
        //         )
        //       )
        //     )
        //   )

        return true
      } catch (error) {
        console.log(error)
        return false
      }
    },
  },
}

export default NextAuth(authOptions)
