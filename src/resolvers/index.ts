// src/resolvers/index.ts
import { bookResolvers } from './bookResolvers';
import { authResolvers } from './authResolvers';

export const resolvers = {
  Query: {
    ...bookResolvers.Query,
    ...authResolvers.Query,
  },
  Mutation: {
    ...bookResolvers.Mutation,
    ...authResolvers.Mutation,
  },
  Book: {}, // Just add empty Book object
};