// src/resolvers/index.ts
import { bookResolvers } from './bookResolvers';
import { authResolvers } from './authResolvers';

// Provide default if Book is undefined
const bookTypeResolvers = bookResolvers.Book || {};

export const resolvers = {
  Query: {
    ...bookResolvers.Query,
    ...authResolvers.Query,
  },
  Mutation: {
    ...bookResolvers.Mutation,
    ...authResolvers.Mutation,
  },
  Book: bookTypeResolvers,
};