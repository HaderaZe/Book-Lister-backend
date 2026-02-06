import User, { IUser } from '../models/User';
import { generateToken } from '../utils/auth';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export const authResolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      return await User.findById(context.user.userId);
    },
  },

  Mutation: {
    register: async (_: any, { input }: { input: RegisterInput }) => {
      // Check if user already exists
      const existingUser = await User.findOne({ email: input.email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const user = new User({
        name: input.name,
        email: input.email,
        password: input.password,
      });

      await user.save();

      // Generate token
      const token = generateToken(user);

      return {
        token,
        user,
      };
    },

    login: async (_: any, { input }: { input: LoginInput }) => {
      // Find user with password field
      const user = await User.findOne({ email: input.email }).select('+password');

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check password
      const isValidPassword = await user.comparePassword(input.password);

      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Generate token
      const token = generateToken(user);

      return {
        token,
        user,
      };
    },
  },
};