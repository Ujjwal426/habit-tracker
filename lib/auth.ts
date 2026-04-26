import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import connectDB from '@/lib/mongoose'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        isSignUp: { label: 'Is Sign Up', type: 'boolean' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const { email, password, name, isSignUp } = credentials

        try {
          await connectDB()

          if (isSignUp === 'true') {
            if (!name) {
              throw new Error('Name is required for sign up')
            }

            const existingUser = await User.findOne({ email })
            if (existingUser) {
              throw new Error('User already exists')
            }

            const hashedPassword = await bcrypt.hash(password, 12)
            const user = await User.create({
              email,
              name,
              password: hashedPassword,
            })

            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
            }
          } else {
            const user = await User.findOne({ email })
            if (!user || !user.password) {
              throw new Error('Invalid credentials')
            }

            const isPasswordValid = await bcrypt.compare(password, user.password)
            if (!isPasswordValid) {
              throw new Error('Invalid credentials')
            }

            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
            }
          }
        } catch (error) {
          console.error('Auth error:', error)
          throw error
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}
