import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials, req) => {
        if (credentials) {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          
          if (user && bcrypt.compareSync(credentials.password, user.password)) {
            return { id: user.id.toString(), email: user.email };
          } else {
            return null;
          }
        }
        return null;
      },      
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    newUser: undefined,
  },

  debug: process.env.NODE_ENV === 'development',
};
export default NextAuth(authOptions);
