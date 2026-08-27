import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Laravel APIへのログインリクエスト
        const res = await fetch(`${process.env.LARAVEL_API_URL}/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });

        if (!res.ok) {
          return null; // 認証失敗
        }

        const data = await res.json();

        return {
          id: String(data.user.id),
          name: data.user.name,
          email: data.user.email,
          accessToken: data.token, // Laravel APIから返されたアクセストークンを含める
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // ログイン時に返されたユーザー情報をトークンに含める
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // JWTトークン情報をセッションに含める
      session.accessToken = token.accessToken;
      session.user.id = token.id as string;

      return session;
    },
  },
  pages: {
    signIn: '/login', // ログインページのパス
  },
});

export { handler as GET, handler as POST };
